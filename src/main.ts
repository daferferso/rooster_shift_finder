// This is the main file to handle the project flow

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

  const user: User | null | undefined = await getUser();
  if (!user) return;

  const page: Page = await getPage(config);

  await handleLogin(page, user, config);
  await loopFinder(page, user, config);
}

main();
