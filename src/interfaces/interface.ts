import { ElementHandle } from "puppeteer";

export interface Config {
  requestDelay: number;
  startDay: string;
  endDay: string;
  useProxy: boolean;
  enableLogs: boolean;
  extensionPath: string;
  timeOutElements: number;
  conditions: [];
  selectors: CssSelectors;
}

export interface CssSelectors {
  emailInput: string;
  passwordInput: string;
  loginButton: string;
  pageTitle: string;
  shiftsPanel: string;
  articleShift: string;
  menuFromAvailableTimes: string;
  menuFromMyProfile: string;
  myProfile: string;
  myAvailableTimes: string;
  buttonDays: string;
}

export interface ShiftJson {
  id: number;
  startAt: Date;
  endAt: Date;
  userId: number;
  zoneId: number;
}

export interface ShiftElement {
  zone: string;
  time: string;
  article?: ElementHandle;
}

export interface Dates {
  [date: string]: ElementHandle<Element>;
}
