// Here we need to handle load config (json file)

import { readFileSync, writeFileSync } from "fs";
import { Config } from "../interfaces/interface";
import path from "path";

const defaultConfig: Config = {
  requestDelay: 0,
  startDay: new Date().toISOString().substring(0, 10),
  endDay: new Date().toISOString().substring(0, 10),
  useProxy: false,
  enableLogs: false,
  extensionPath: `${path.join(process.cwd(), "utils/extension")}`,
  timeOutElements: 150,
  conditions: [],
  selectors: {
    emailInput: "",
    passwordInput: "",
    loginButton: "",
    pageTitle: "",
    shiftsPanel: "",
    articleShift: "",
    menuFromAvailableTimes: "",
    menuFromMyProfile: "",
    myAvailableTimes: "",
    myProfile: "",
    buttonDays: "",
  },
};

export const loadConfig = () => {
  try {
    return JSON.parse(readFileSync("utils/config.json", { encoding: "utf-8" }));
  } catch (err) {
    writeFileSync("utils/config.json", JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
};
