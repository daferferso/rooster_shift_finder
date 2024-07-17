import { User } from "@prisma/client";
import { Page } from "puppeteer";
import { Config } from "../interfaces/interface";

export const login = async (page: Page, user: User, config: Config) => {
  await page.goto("https://bo.usehurrier.com/app/rooster/web/login");
  await page.waitForSelector(config.selectors.emailInput);
  await page.type(config.selectors.emailInput, user.email);
  await page.type(config.selectors.passwordInput, user.password);
  await page.click(config.selectors.loginButton);
};

export const validateLogin = async (page: Page, config: Config) => {
  try {
    await page.waitForSelector(config.selectors.pageTitle);
    return true;
  } catch (err) {
    return false;
  }
};
