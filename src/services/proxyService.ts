// Here we need to handle proxy rotative connection

import { Proxy } from "@prisma/client";
import { Browser } from "puppeteer-core";
import { activateProxy, registerProxy } from "../scripts/proxy";
import { Logger } from "winston";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";
import { Config } from "../interfaces/interface";

export const handleProxyConnection = async (
  proxy: Proxy,
  browser: Browser,
  config: Config,
  logger: Logger
) => {
  // This function handle the proxy connection to register and activate next proxy
  logger.info("Handling proxies");
  const page = await browser.newPage();

  await page.goto(`${config.extensionUrl}/options.html`);
  await registerProxy(page, proxy, logger);

  await page.goto(`${config.extensionUrl}/popup.html`);
  await activateProxy(page, proxy, logger);

  try {
    await page.close();
  } catch (error) {}
};

export const createProxyAgent = async (proxy: Proxy): Promise<Agent> => {
  // This function return a new HttpsProxyAgent to use after in take proxy request
  return new HttpsProxyAgent(
    `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
  );
};
