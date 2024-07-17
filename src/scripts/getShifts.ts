// This is a script to get all Shifts using pupeeteer

import { Page } from "puppeteer";
import { ShiftElement } from "../interfaces/interface";

export const getShifts = async (page: Page): Promise<ShiftElement[]> => {
  await page.waitForSelector(
    "#app > div.Y_H7dxviaGWF8ClZOdze > div > div.uSWxsCRpZKLcGVs6a7YQ > div > div.cOWIDMF8UbrRpI6N7npl > div > div.L_I3pXDJRKAtG8_Xex8j > div > div > article"
  );

  const articles = await page.$$(
    "#app > div.Y_H7dxviaGWF8ClZOdze > div > div.uSWxsCRpZKLcGVs6a7YQ > div > div.cOWIDMF8UbrRpI6N7npl > div > div.L_I3pXDJRKAtG8_Xex8j > div > div > article"
  );

  let shifts: ShiftElement[] = [];
  console.time("Tiempo");
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
