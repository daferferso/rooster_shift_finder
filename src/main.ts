// This is the main file to handle the project flow

import winston, { Logger } from "winston";
import { Page } from "puppeteer";
import { loadConfig } from "./services/configService";
import { Config } from "./interfaces/interface";
import { clearDataBrowser, getPage } from "./services/pupeeteerService";
import { Proxy, User } from "@prisma/client";
import { handleLogin } from "./services/loginService";
import { loopFinder } from "./services/loopService";
import { getProxies, getUser } from "./services/dataService";
import {
  createProxyAgent,
  handleProxyConnection,
} from "./services/proxyService";

async function main() {
  // Load config and initialize logger
  const config: Config = loadConfig();
  const logger: Logger = await createLogger(config);

  // Get data from de DB
  const user: User | null | undefined = await getUser();
  if (!user) return;
  let proxies: Proxy[] | null | undefined = await getProxies(user);
  if (!proxies || proxies.length === 0) return;

  // Get instance of Page from Pupeeteer
  const page: Page = await getPage(config);

  while (true) {
    const nextProxy = proxies.shift()!;
    const proxyAgent = await createProxyAgent(nextProxy);
    proxies.push(nextProxy);
    try {
      await handleProxyConnection(nextProxy, page.browser(), logger);
      await handleLogin(page, user, config, logger);
      await loopFinder(page, user, config, proxyAgent, logger);
    } catch (error) {
      logger.error(`An error in main loop ${error}`);
    } finally {
      await clearDataBrowser(page, logger);
    }
  }
}

async function createLogger(config: Config): Promise<Logger> {
  let loggerTransports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} - ${info.level}: ${info.message}`
        )
      ),
    }),
    new winston.transports.File({
      filename: "app.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} - ${info.level}: ${info.message}`
        )
      ),
    }),
  ];

  if (!config.log) {
    loggerTransports.pop();
  }

  const logger = winston.createLogger({
    level: "debug",
    transports: loggerTransports,
  });
  return logger;
}

main();
