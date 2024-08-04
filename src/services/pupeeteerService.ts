// Here we need to handle the initial instance to run Chrome Browser

import puppeteer, { Browser, Page,  } from "puppeteer-core";
import { Config } from "../interfaces/interface";
import { KnownDevices } from "puppeteer-core";
import { sleep } from "./utilsService";
import { Logger } from "winston";

export async function getPage(config: Config): Promise<Page> {
  // This function return a new Page with all settings from config.json
  const iPhone = KnownDevices["Galaxy S9+"];
  const browser: Browser = await puppeteer.launch({
    executablePath: config.browserPath,
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
  // This function clear all data Chrome Browser using KeyEvents
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
