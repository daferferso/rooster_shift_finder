// Here we need to handle proxy rotative connection

import { Proxy } from "@prisma/client";
import { Browser } from "puppeteer";
import { activateProxy, registerProxy } from "../scripts/proxy";
import { Logger } from "winston";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";

export const handleProxyConnection = async (
  proxy: Proxy,
  browser: Browser,
  logger: Logger
) => {
  logger.info("Handling proxies");
  const page = await browser.newPage();
  await page.goto(
    "chrome-extension://ilommichiccmkhjghmjgmamnbocelocm/options.html"
  );

  await registerProxy(page, proxy, logger);

  await page.goto(
    "chrome-extension://ilommichiccmkhjghmjgmamnbocelocm/popup.html"
  );

  await activateProxy(page, proxy, logger);
  try {
    await page.close();
  } catch (error) {}
};

export const createProxyAgent = async (proxy: Proxy): Promise<Agent> => {
  return new HttpsProxyAgent(
    `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
  );
};
