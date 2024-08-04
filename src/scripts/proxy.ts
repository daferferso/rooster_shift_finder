// This script is use to connect a proxy using Chrome extension

import { Proxy } from "@prisma/client";
import { Page } from "puppeteer-core";
import { sleep } from "../services/utilsService";
import { Logger } from "winston";

export const registerProxy = async (
  page: Page,
  proxy: Proxy | null | undefined,
  logger: Logger
) => {
  if (!proxy) return;
  await closeFirstWindows(page, logger);
  logger.info(`Registering new Proxy ${proxy.host}:${proxy.port}`);
  await page.waitForSelector("#body");
  await page.evaluate(() => {
    const checkbox = document.querySelector(
      "#useSameProxy"
    ) as HTMLInputElement;
    checkbox.click();
  });
  await page.evaluate(writeText, "#profileName", proxy.host);
  await page.evaluate(writeText, "#httpProxyHost", proxy.host);
  await page.evaluate(writeText, "#httpProxyPort", String(proxy.port));
  await sleep(1000);
  await page.locator("#saveOptions").click();
};

export const activateProxy = async (
  page: Page,
  proxy: Proxy | null | undefined,
  logger: Logger
) => {
  if (!proxy) return;
  await page.waitForSelector("#menu");
  logger.info(`Activating ${proxy.host}:${proxy.port}`);
  const proxiesButton = await page.$$("#proxies > div.item.proxy > span");
  for (const element of proxiesButton) {
    const value = await page.evaluate((el) => el.textContent, element);
    if (!(value === proxy.host)) continue;
    await element.click();
    return;
  }
};

const writeText = (selector: any, text: string) => {
  const input = document.querySelector(selector);
  if (input) {
    input.value = text;
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    return;
  }
};

const closeFirstWindows = async (page: Page, logger: Logger) => {
  try {
    await sleep(500);
    await page.click("#btnCancel");
  } catch (error) {
    logger.error("Not found btnCancel");
    return;
  }
};
