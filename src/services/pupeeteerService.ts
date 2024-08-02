// Here we need to handle the initial instance to run Chrome Browser

import puppeteer, { Browser, Page, PuppeteerError } from "puppeteer";
import { Config } from "../interfaces/interface";
import { KnownDevices } from "puppeteer";
import { sleep } from "./utilsService";
import { Logger } from "winston";

export async function getPage(config: Config): Promise<Page> {
  const iPhone = KnownDevices["Galaxy S9+"];
  const browser: Browser = await puppeteer.launch({
    protocolTimeout: config.timeOutResponse,
    headless: false,
    defaultViewport: { width: 400, height: 650, isMobile: true },
    args: [
      `--window-size=400,650`,
      `--disable-extensions-except=${config.extensionPath}`,
      `--load-extension=${config.extensionPath}`,
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });
  const [page]: Page[] = await browser.pages();
  await page.emulate(iPhone);
  page.setDefaultTimeout(config.timeOutElements);
  page.setDefaultNavigationTimeout(config.timeOutElements);
  return page;
}

export const clearDataBrowser = async (page: Page, logger: Logger) => {
  logger.info("Cleaning data");
  await page.goto("chrome://settings/clearBrowserData");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    await sleep(300);
  }

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("ArrowDown");
    await sleep(100);
  }

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    await sleep(300);
  }

  await page.keyboard.press("Enter");
  logger.info("Data cleaned");
};
