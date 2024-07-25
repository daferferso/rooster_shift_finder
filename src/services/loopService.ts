// Here we need to handle an infinity loop to search shifts

import { Page } from "puppeteer";
import { Config, Dates } from "../interfaces/interface";
import { User, Zone } from "@prisma/client";
import { handleRequest, handleResponse } from "./shiftService";
import { refreshMenu, refreshBackAndForward } from "../scripts/menu";
import { getAllDays, goToDay } from "../scripts/days";
import { sleep } from "./utilsService";

export const loopFinder = async (page: Page, user: User, config: Config) => {
  // Simple code to find shifts everytime

  const allZoneIds: number[] = config.conditions.flatMap(
    (condition) => condition.placesId
  );
  const uniqueZoneIds: string = [...new Set(allZoneIds)].join(",");

  await page.reload();

  const dates: Dates = await getAllDays(page, config);
  await goToDay(dates[config.startDay.split("-")[2]]);
  await refreshMenu(page, config);

  page.setRequestInterception(true);
  page.on("request", async (req) => {
    await handleRequest(req, config, uniqueZoneIds);
  });
  page.on("response", async (res) => {
    await handleResponse(res, user, config);
  });

  while (true) {
    try {
      await sleep(config.requestDelay);
      await refreshBackAndForward(page);
    } catch (error) {
      console.error("Error during loop execution:", error);
      break;
    }
  }
};
