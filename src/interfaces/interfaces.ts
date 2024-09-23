import { ElementHandle } from "puppeteer-core";

/**
 * Represents the user's account information, including credentials, location, and proxy settings.
 */
export interface Account {
  id: number;
  email: string;
  password: string;
  country: {
    code: string;
    cityId: number;
    tz: string;
  };
  useProxy: boolean;
  proxies: string[];
  schedule: {
    start: string;
    end: string;
  };
  conditions: Condition[];
  shifts: Shift[];
}

/**
 * Represents the data structure containing an account.
 */
export interface Data {
  account: Account;
}

/**
 * Configuration settings for the application, including paths, delays, and timeouts.
 */
export interface Config {
  requestDelay: number;
  extensionPath: string;
  extensionUrl: string;
  browserPath: string;
  timeOutElements: number;
  timeOutResponse: number;
  selectors: CssSelectors;
}

/**
 * Interface for managing API requests, including URLs and headers.
 */
export interface Requests {
  [key: string]: {
    availableUnassignedShifts: {
      url: string;
      headers: { [key: string]: string };
    };
    availableSwaps: {
      url: string;
      headers: { [key: string]: string };
    };
  };
}

/**
 * Represents the CSS selectors used to interact with the login page.
 */
export interface CssSelectors {
  emailInput: string;
  passwordInput: string;
  loginButton: string;
  pageTitle: string;
}

/**
 * Represents the conditions to filter shifts, including dates, times, and places.
 */
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

/**
 * Represents a work shift, including details about timing and location.
 */
export interface Shift {
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

/**
 * Interface for handling date-specific elements in the DOM.
 */
export interface Dates {
  [date: string]: ElementHandle<Element>;
}

/**
 * Represents proxy server details, including host and port.
 */
export interface Proxy {
  host: string;
  port: number;
}
