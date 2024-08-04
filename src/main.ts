// This is the main file to handle the project flow

import winston, { Logger } from "winston";
import { Page, ProtocolError } from "puppeteer-core";
import { Proxy, User } from "@prisma/client";
import {
  AccountNotLoggedError,
  Config,
  ProxyBannedError,
} from "./interfaces/interface";
import { loadConfig } from "./services/configService";
import { clearDataBrowser, getPage } from "./services/pupeeteerService";
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
  logger.info("Logger created successfull");

  // Get data from de DB
  const user: User | null | undefined = await getUser();
  if (!user) return;
  let proxies: Proxy[] | null | undefined = await getProxies(user);
  if (!proxies || proxies.length === 0) return;
  logger.info(`Data getted successfull`);


  // Get instance of Page from Pupeeteer
  const page: Page = await getPage(config);
  logger.info("Page Chrome created successfull");
  
  // let maxIterToRelogin = 0;
  let logged = false;
  while (true) {
    const nextProxy = proxies.shift()!;
    const proxyAgent = await createProxyAgent(nextProxy);
    proxies.push(nextProxy);

    try {
      if (!logged) {
        await handleProxyConnection(nextProxy, page.browser(), config, logger);
        await handleLogin(page, user, config, logger);
        logged = true;
      }
      await loopFinder(page, user, config, proxyAgent, logger);
    } catch (error) {
      logger.error(`An error in main loop ${error}`);
      if (error instanceof ProxyBannedError || ProtocolError) {
        await handleProxyConnection(nextProxy, page.browser(), config, logger);
        await page.reload();
      }
      if (error instanceof AccountNotLoggedError) {
        await clearDataBrowser(page, logger);
        await handleLogin(page, user, config, logger);
        logged = true;
      }
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
