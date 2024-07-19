// Here we need to handle an infinity loop to search shifts

import { Page } from "puppeteer";
import { Config } from "../interfaces/interface";
import { User } from "@prisma/client";
import { getShifts } from "../scripts/getShifts";
import { filterShifts } from "./shiftService";
import { refreshMenu, refreshBackAndForward } from "../scripts/menu";

export const loopFinder = async (page: Page, user: User, config: Config) => {
  // Simple code to find shifts everytime
  await refreshMenu(page, config);

  while (true) {
    try {
      await new Promise((resolve) => setTimeout(resolve, config.requestDelay));

      await refreshBackAndForward(page);

      const shiftsElements = await getShifts(page, config);
      if (shiftsElements.length === 0) continue;

      const filteredShifts = await filterShifts(shiftsElements);

      console.log("Shifts filtered:", filteredShifts.length);
    } catch (error) {
      console.error("Error during loop execution:", error);
      break;
    }
  }
};
