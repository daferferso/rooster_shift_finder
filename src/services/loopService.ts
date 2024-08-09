// Here we need to handle an infinity loop to search shifts

import { Page } from "puppeteer-core";
import { Config, Dates, ProxyBannedError, UserMod } from "../interfaces/interface";
import { handleRequest, handleResponse } from "./shiftService";
import { refreshMenu, refreshBackAndForward } from "../scripts/menu";
import { getAllDays, goToDay } from "../scripts/days";
import { sleep } from "./utilsService";
import { Logger } from "winston";
import { Agent } from "http";
import { checkIfLogged } from "./loginService";

export const loopFinder = async (
  page: Page,
  user: UserMod,
  config: Config,
  proxyAgent: Agent,
  logger: Logger,
  needRefresh: boolean
) => {
  /*
  Loop to get shifts every millisecond defined in config.requestDelay
  & Intercept the responses from every requests
  */

  // Remove all event handlers
  page.removeAllListeners("request");
  page.removeAllListeners("response");

  // Get all Zone Ids and concatenate in one list to mockup requests
  const allZoneIds: number[] = config.conditions.flatMap(
    (condition) => condition.placesId
  );
  const uniqueZoneIds: string = [...new Set(allZoneIds)].join(",");

  // Check if need to refresh after change proxy then get all dates and go to specific day & refresh Menu
  if (needRefresh) {
    const dates: Dates = await getAllDays(page, config);
    await goToDay(dates[config.startDay.split("-")[2]]);
    await refreshMenu(page, config);
  }

  // Enable Intercept Requests & set a Promise to handle Requests & Responses error
  page.setRequestInterception(true);

  let rejectLoopFinder: (error: unknown) => void;
  const responsePromise = new Promise<void>((_, reject) => {
    rejectLoopFinder = reject;
  });

  page.on("request", async (req) => {
    if (req.isInterceptResolutionHandled()) return;
    await handleRequest(req, config, user, uniqueZoneIds, logger);
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
    // Loop to get new shifts
    try {
      await checkIfLogged(page);
      await Promise.race([sleep(config.requestDelay), responsePromise]);
      await refreshBackAndForward(page);
    } catch (error) {
      logger.error("Error during loop execution:", error);
      throw error;
    }
  }
};
