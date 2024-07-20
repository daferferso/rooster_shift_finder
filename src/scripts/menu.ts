import { Page } from "puppeteer";
import { Config } from "../interfaces/interface";

export const refreshMenu = async (page: Page, config: Config) => {
  await page.locator(config.selectors.menuFromAvailableTimes).click();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.locator(config.selectors.myProfile).click();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.locator(config.selectors.menuFromMyProfile).click();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await page.locator(config.selectors.myAvailableTimes).click();
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const refreshBackAndForward = async (page: Page) => {
  await page.goBack();
  await page.goForward();
};
