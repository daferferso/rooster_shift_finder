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
  conditions: [
    {
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      startTime: "07:00:00",
      endTime: "03:00:00",
      minTime: {
        hours: 1,
        minutes: 0,
      },
      placesId: [1],
    },
  ],
  selectors: {
    emailInput: "",
    passwordInput: "",
    loginButton: "",
    pageTitle: "",
    shiftsPanel: "",
    shiftButtons: "",
    shiftBoxes: "",
    menuFromAvailableTimes: "",
    menuFromMyProfile: "",
    myAvailableTimes: "",
    myProfile: "",
    buttonDays: "",
  },
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "es-419,es;q=0.6",
    baggage: "abc",
    "client-version": "abc",
    "content-type": "application/json",
    priority: "u=1, i",
    "sec-ch-ua": "abc",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "sentry-trace": "abc",
    cookie: "abc",
    "Referrer-Policy": "strict-origin-when-cross-origin",
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
