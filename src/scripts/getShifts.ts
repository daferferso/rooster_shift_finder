// This is a script to get all Shifts using pupeeteer

import { Page } from "puppeteer";
import { Config, ShiftElement } from "../interfaces/interface";

export const getShifts = async (
  page: Page,
  config: Config
): Promise<ShiftElement[]> => {
  await page.waitForSelector(config.selectors.shiftsPanel);
  const articles = await page.$$(config.selectors.articleShift);

  let shifts: ShiftElement[] = [];
  for (const article of articles) {
    let shift: ShiftElement = await article?.evaluate((article) => {
      return {
        zone: article.getElementsByTagName("h2")[0].innerText,
        time: article.getElementsByTagName("p")[0].innerText,
      };
    });
    shift.article = article;
    shifts.push(shift);
  }
  return shifts;
};
