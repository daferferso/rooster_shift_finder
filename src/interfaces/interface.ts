// Here we need to set all Interfaces or classes to define the type.

import { ElementHandle } from "puppeteer-core";
import { City, Country, Proxy, User } from "@prisma/client";

export interface UserMod extends User {
  id: number;
  email: string;
  password: string;
  cityId: number;
  City: CityMod;
  proxies?: Proxy[] | null;
}

export interface CityMod extends City {
  id: number;
  name: string;
  countryId: number;
  Country: Country;
}

export interface Config {
  log: boolean;
  requestDelay: number;
  startDay: string;
  endDay: string;
  extensionPath: string;
  extensionUrl: string;
  browserPath: string;
  timeOutElements: number;
  timeOutResponse: number;
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
  Referer?: string;
  mode?: string;
  credentials?: string;
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
  id: number;
  shift_id?: number;
  start: string;
  end: string;
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

export class ProxyBannedError extends Error {
  constructor(message: string = "The proxy was banned") {
    super(message);
    this.name = "ProxyBannedError";
  }
}

export class MaxRetryNumberError extends Error {
  constructor() {
    super();
    this.name = "MaxRetryNumberError";
  }
}

export class AccountNotLoggedError extends Error {
  constructor(message: string = "The token was not found") {
    super(message);
    this.name = "AccountNotLoggedError";
  }
}
