// This is the main file to handle the project flow

import winston, { Logger } from "winston";
import { Page, ProtocolError } from "puppeteer-core";
import { Proxy } from "@prisma/client";
import {
  AccountNotLoggedError,
  Config,
  ProxyBannedError,
  UserMod,
} from "./interfaces/interface";
import { loadConfig } from "./services/configService";
import { clearDataBrowser, getPage } from "./services/pupeeteerService";
import { handleLogin } from "./services/loginService";
import { loopFinder } from "./services/loopService";
import { getUser } from "./services/dataService";
import {
  createProxyAgent,
  handleProxyConnection,
} from "./services/proxyService";

async function main() {
  // This is the main function to initializate the program

  // Load config and initialize logger
  const config: Config = loadConfig();
  const logger: Logger = await createLogger(config);
  logger.info("Logger created successfull");

  // Get data from de DB
  const user: UserMod | null | undefined = await getUser();
  if (!user) {
    logger.error(
      "Before to start, you need to add Country, City, Zone, User, Proxy"
    );
    return;
  }
  let proxies: Proxy[] | null | undefined = user.proxies;
  if (!proxies || proxies.length === 0) return;
  logger.info(`Data getted successfull`);

  // Get instance of Page from Pupeeteer
  const page: Page = await getPage(config);
  logger.info("Page Chrome created successfull");

  let logged = false;
  let needRefresh = true;

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
      await loopFinder(page, user, config, proxyAgent, logger, needRefresh);
    } catch (error) {
      logger.error(`An error in main loop ${error}`);
      if (error instanceof ProxyBannedError || ProtocolError) {
        await handleProxyConnection(nextProxy, page.browser(), config, logger);
        needRefresh = false
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
  // This function return a new Logger
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
