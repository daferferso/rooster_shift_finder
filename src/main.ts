// This is the main file to handle the project flow

import winston, { Logger } from "winston";
import { Page } from "puppeteer";
import { loadConfig } from "./services/configService";
import { Config } from "./interfaces/interface";
import { getPage } from "./services/pupeeteerService";
import { User } from "@prisma/client";
import { handleLogin } from "./services/loginService";
import { loopFinder } from "./services/loopService";
import { getUser } from "./services/dataService";

async function main() {
  const config: Config = loadConfig();

  const logger: Logger = await createLogger(config);

  const user: User | null | undefined = await getUser();
  if (!user) return;

  const page: Page = await getPage(config);

  await handleLogin(page, user, config, logger);
  await loopFinder(page, user, config, logger);
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
