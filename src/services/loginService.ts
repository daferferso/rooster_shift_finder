// Here we need to handle all about login

import { Page } from "puppeteer";
import { User } from "@prisma/client";
import { login, validateLogin } from "../scripts/loginAccount";
import { Config } from "../interfaces/interface";

export const handleLogin = async (page: Page, user: User, config: Config) => {
  // Handle User Login
  await login(page, user, config);
  const logged = await validateLogin(page, config);
  if (!logged) await page.browser().close();
};
