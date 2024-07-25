// Here we need to handle the initial instance to run Chrome Browser

import puppeteer, { Browser, Page, PuppeteerError } from "puppeteer";
import { Config } from "../interfaces/interface";
import { KnownDevices } from "puppeteer";

export async function getPage(config: Config): Promise<Page> {
  const iPhone = KnownDevices["Galaxy S9+"];
  const browser: Browser = await puppeteer.launch({
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
  return page;
}
