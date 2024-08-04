// Here we need to handle an infinity loop to search shifts

import { Page } from "puppeteer-core";
import { Config, Dates, ProxyBannedError } from "../interfaces/interface";
import { User } from "@prisma/client";
import { handleRequest, handleResponse } from "./shiftService";
import { refreshMenu, refreshBackAndForward } from "../scripts/menu";
import { getAllDays, goToDay } from "../scripts/days";
import { sleep } from "./utilsService";
import { Logger } from "winston";
import { Agent } from "http";
import { checkIfLogged } from "./loginService";

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
      if (res.status() != 200) throw new ProxyBannedError();
      await handleResponse(res, user, config, proxyAgent, logger);
    } catch (error) {
      rejectLoopFinder(error); // Reject the promise to propagate the error
    }
  });

  while (true) {
    try {
      await checkIfLogged(page),
        await Promise.race([sleep(config.requestDelay), responsePromise]);

      if (!config.backFowardRefresh) {
        await refreshMenu(page, config);
      } else {
        await refreshBackAndForward(page);
      }
    } catch (error) {
      logger.error("Error during loop execution:", error);
      throw error;
    }
  }
};
