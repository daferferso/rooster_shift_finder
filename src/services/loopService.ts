// Here we need to handle an infinity loop to search shifts

import { Page, ProtocolError } from "puppeteer";
import {
  Config,
  Dates,
  MaxRetryNumberError,
  ProxyBannedError,
} from "../interfaces/interface";
import { Proxy, User, Zone } from "@prisma/client";
import { handleRequest, handleResponse } from "./shiftService";
import { refreshMenu, refreshBackAndForward } from "../scripts/menu";
import { getAllDays, goToDay } from "../scripts/days";
import { sleep } from "./utilsService";
import { Logger } from "winston";
import { Agent } from "http";

export const loopFinder = async (
  page: Page,
  user: User,
  config: Config,
  proxyAgent: Agent,
  logger: Logger
) => {
  // Simple code to find shifts everytime

  const allZoneIds: number[] = config.conditions.flatMap(
    (condition) => condition.placesId
  );
  const uniqueZoneIds: string = [...new Set(allZoneIds)].join(",");

  const dates: Dates = await getAllDays(page, config);
  await goToDay(dates[config.startDay.split("-")[2]]);
  await refreshMenu(page, config);

  page.setRequestInterception(true);

  let rejectLoopFinder: (error: unknown) => void;
  const responsePromise = new Promise<void>((_, reject) => {
    rejectLoopFinder = reject;
  });

  page.on("request", async (req) => {
    if (req.isInterceptResolutionHandled()) return;
    await handleRequest(req, config, uniqueZoneIds, logger);
  });

  page.on("response", async (res) => {
    try {
      if (res.status() === 429) throw new ProxyBannedError();
      await handleResponse(res, user, config, proxyAgent, logger);
    } catch (error) {
      rejectLoopFinder(error); // Reject the promise to propagate the error
    }
  });

  let currentRetry = 0;
  let maxIterToRelogin = 0;

  while (true) {
    try {
      await Promise.race([
        sleep(config.requestDelay),
        responsePromise, // Race the sleep and responsePromise to propagate errors immediately
      ]);

      await refreshBackAndForward(page);

      maxIterToRelogin++;
      if (maxIterToRelogin >= config.maxIterToRelogin) return;
    } catch (error) {
      logger.error("Error during loop execution:", error);
      if (error instanceof ProxyBannedError || ProtocolError) {
        throw error; // Propagate specific error to be handled in main
      }
      if (currentRetry >= config.maxRetryNumber) return;
      await page.reload();
      currentRetry++;
    }
  }
};
