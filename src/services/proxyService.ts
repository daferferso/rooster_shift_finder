// Here we need to handle proxy rotative connection

import { Proxy } from "@prisma/client";
import { Browser } from "puppeteer-core";
import { activateProxy, registerProxy } from "../scripts/proxy";
import { Logger } from "winston";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "http";
import { Config } from "../interfaces/interface";
import { sleep } from "./utilsService";

export const handleProxyConnection = async (
  proxy: Proxy,
  browser: Browser,
  config: Config,
  logger: Logger
) => {
  // This function handle the proxy connection to register and activate next proxy
  logger.info("Handling proxies");
  const page = await browser.newPage();

  try {
    await page.goto(`${config.extensionUrl}/options.html`);
    await registerProxy(page, proxy, logger);

    await page.goto(`${config.extensionUrl}/popup.html`);
    await activateProxy(page, proxy, logger);
  } catch (error) {
    logger.error(error);
    logger.info(
      "You have 60 seconds to get extension URL and save in config.json"
    );
    await sleep(60000);
    throw error;
  }

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
