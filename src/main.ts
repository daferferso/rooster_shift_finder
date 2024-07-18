// This is the main file to handle the project flow

import { Page } from "puppeteer";
import { loadConfig } from "./services/configService";
import { Config } from "./interfaces/interface";
import { closeAllPages, getPage } from "./services/pupeeteerService";
import { User } from "@prisma/client";
import { getUser, handleLogin } from "./services/loginService";
import { loopFinder } from "./services/loopService";

async function main() {
  // Load all config
  const config: Config = loadConfig();

  // Get User or return
  const user: User | undefined = await getUser();
  if (!user) return;

  // Get browser to navigate
  const page: Page = await getPage(config);
  await closeAllPages(page);

  // Login
  await handleLogin(page, user, config);

  // Start loop to find shifts
  await loopFinder(page, user, config);
}

main();
