// Here we need to handle all about login

import { Page } from "puppeteer";
import { User } from "@prisma/client";
import { login, validateLogin } from "../scripts/loginAccount";
import { prisma } from "../services/dataService";
import { Config } from "../interfaces/interface";

export const getUser = async (): Promise<User | undefined> => {
  // Get User from db
  const user: User | null = await prisma.user.findFirst();
  if (!user) return;
  return user;
};

export const handleLogin = async (page: Page, user: User, config: Config) => {
  // Handle User Login
  await login(page, user, config);
  const logged = await validateLogin(page, config);
  if (!logged) await page.browser().close();
};
