// This is a script to go to specific day in the web app

import { ElementHandle, Page } from "puppeteer-core";
import { Config, Dates } from "../interfaces/interface";

export const getAllDays = async (
  page: Page,
  config: Config
): Promise<Dates> => {
  await page.waitForSelector(config.selectors.buttonDays);
  const buttons = await page.$$(config.selectors.buttonDays);
  let buttonDates: Dates = {};

  for (const button of buttons) {
    const day: string | undefined = await button?.evaluate((button) => {
      return button.querySelector("span")?.innerText.trim();
    });
    if (!day) continue;
    buttonDates[day] = button;
  }
  return buttonDates;
};

export const goToDay = async (date: ElementHandle<Element>) => {
  await waitForElementToBeEnabled(date);
  await date.click();
};

export const waitForElementToBeEnabled = async (
  element: ElementHandle<Element>
) => {
  await element.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        if (!(el as HTMLInputElement).disabled) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(el, { attributes: true });
    });
  });
};
