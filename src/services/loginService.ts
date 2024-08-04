// Here we need to handle all about login

import { Page } from "puppeteer-core";
import { User } from "@prisma/client";
import { login, validateLogin } from "../scripts/loginAccount";
import { AccountNotLoggedError, Config } from "../interfaces/interface";
import { Logger } from "winston";

export const handleLogin = async (
  page: Page,
  user: User,
  config: Config,
  logger: Logger
) => {
  // Handle User Login
  await login(page, user, config);
  const logged = await validateLogin(page, config);
  if (!logged) {
    logger.error(`Credentials error - ${user.email}`);
    return await page.browser().close();
  }
  logger.info(`Login successfull - ${user.email}`);

  await page.reload();
};

export const checkIfLogged = async (page: Page) => {
  const token: string | null = await page.evaluate(() => {
    return localStorage.getItem("token");
  });
  if (!token) throw new AccountNotLoggedError();
};
