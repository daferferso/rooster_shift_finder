import { Zone } from "@prisma/client";
import { Moment } from "moment-timezone";
import { ElementHandle } from "puppeteer";

export interface Config {
  requestDelay: number;
  startDay: string;
  endDay: string;
  useProxy: boolean;
  enableLogs: boolean;
  extensionPath: string;
  timeOutElements: number;
  conditions: Condition[];
  selectors: CssSelectors;
  headers: Headers;
}

export interface Headers {
  accept: string;
  "accept-language": string;
  baggage: string;
  "client-version": string;
  "content-type": string;
  priority: string;
  "sec-ch-ua": string;
  "sec-ch-ua-mobile": string;
  "sec-ch-ua-platform": string;
  "sec-fetch-dest": string;
  "sec-fetch-mode": string;
  "sec-fetch-site": string;
  "sec-gpc": string;
  "sentry-trace": string;
  cookie: string;
  "Referrer-Policy": string;
  authorization?: string;
  Referer?: string
}

export interface CssSelectors {
  emailInput: string;
  passwordInput: string;
  loginButton: string;
  pageTitle: string;
  shiftsPanel: string;
  shiftButtons: string;
  shiftBoxes: string;
  menuFromAvailableTimes: string;
  menuFromMyProfile: string;
  myProfile: string;
  myAvailableTimes: string;
  buttonDays: string;
}

export interface Condition {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  minTime: {
    hours: number;
    minutes: number;
  };
  placesId: number[];
}

export interface ShiftJson {
  id?: number;
  shift_id?: number;
  start?: string;
  end?: string;
  start_at?: string;
  end_at?: string;
  status?: string;
  time_zone?: string;
  starting_point_id: number;
  starting_point_name: number;
  incentivization_level: number;
  multipliers: [];
}

export interface Dates {
  [date: string]: ElementHandle<Element>;
}
