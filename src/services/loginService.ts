// Here we need to handle all about login

import { Page } from "puppeteer-core";
import { login, validateLogin } from "../scripts/loginAccount";
import { AccountNotLoggedError, Config, UserMod } from "../interfaces/interface";
import { Logger } from "winston";

export const handleLogin = async (
  page: Page,
  user: UserMod,
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
  // Check if the account is still connected by verifying the existing token
  const token: string | null = await page.evaluate(() => {
    return localStorage.getItem("token");
  });
  if (!token) throw new AccountNotLoggedError();
};
