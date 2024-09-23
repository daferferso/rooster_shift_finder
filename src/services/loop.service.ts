import { Page } from "puppeteer-core";
import { Account, Config, Requests, Shift } from "../interfaces/interfaces";
import { sleep } from "./utils.service";
import { Logger } from "winston";
import { AuthService } from "./auth.service";
import moment from "moment-timezone";
import { mockupSwapUrl, mockupUnassignedUrl } from "./utils.service";
import { ShiftService } from "./shift.service";
import { ProxyBannedError } from "../errors/errors";

/**
 * Service class for managing the loop that checks for shifts and swaps.
 */
export class LoopService {
  private page: Page;
  private account: Account;
  private config: Config;
  private logger: Logger;
  private authService: AuthService;
  public baseRequests: any;
  private requests: object | any;

  /**
   * Constructs a LoopService instance.
   *
   * @param {Page} page - The Puppeteer Page object.
   * @param {Account} account - The account information.
   * @param {Config} config - Configuration settings.
   * @param {Logger} logger - Logger instance for logging information.
   */
  constructor(page: Page, account: Account, config: Config, logger: Logger) {
    this.page = page;
    this.account = account;
    this.config = config;
    this.logger = logger;
    this.authService = new AuthService(page, config, logger);
    this.baseRequests = {};
    this.requests = {};
  }

  /**
   * Creates request URLs for each day in the account's schedule.
   * Requests are based on the account's conditions and scheduled days.
   */
  createRequestsByDay() {
    const allZoneIds: number[] = this.account.conditions.flatMap(
      (condition) => condition.placesId
    );
    const uniqueZoneIds: string = [...new Set(allZoneIds)].join(",");

    const start = moment(this.account.schedule.start);
    const end = moment(this.account.schedule.end);
    const days = Array.from({ length: end.diff(start, "days") + 1 }, (_, i) =>
      moment(start).clone().add(i, "days")
    );

    this.requests = days.reduce((requestsObj: Requests, day) => {
      requestsObj[String(day.date())] = {
        availableUnassignedShifts: {
          url: mockupUnassignedUrl(
            day,
            this.baseRequests.availableUnassignedShifts.url,
            this.account,
            uniqueZoneIds
          ),
          headers: this.baseRequests.availableUnassignedShifts.headers,
        },
        availableSwaps: {
          url: mockupSwapUrl(
            day,
            this.baseRequests.availableSwaps.url,
            this.account,
            uniqueZoneIds
          ),
          headers: this.baseRequests.availableSwaps.headers,
        },
      };
      return requestsObj;
    }, {});
  }

  /**
   * Fetches unassigned shifts based on the provided request.
   *
   * @param {any} request - The request object containing the URL and headers.
   * @returns {Promise<{ swap: boolean; data: Shift[] }>} The result containing the swap status and shift data.
   */
  async getShifts(request: any): Promise<{ swap: boolean; data: Shift[] }> {
    const result: { value: string; status: number } = await this.page.evaluate(
      async (request) => {
        const response = await fetch(request.url, {
          headers: request.headers,
        });
        const value = await response.text();
        return { value: value, status: response.status };
      },
      request
    );
    this.logger.info(
      `SHIFT STATUS: ${result.status} | ${this.account.email} | SHIFT TAKED: ${this.account.shifts.length}`
    );
    if (result.status == 200) {
      const data: any = JSON.parse(result.value);
      this.logger.info(`SHIFT FOUND:  ${data.content.length}`);
      return { swap: false, data: data.content };
    }
    return { swap: false, data: [] };
  }

  /**
   * Fetches swap shifts based on the provided request.
   *
   * @param {any} request - The request object containing the URL and headers.
   * @returns {Promise<{ swap: boolean; data: Shift[] }>} The result containing the swap status and swap data.
   */
  async getSwaps(request: any): Promise<{ swap: boolean; data: Shift[] }> {
    const result: { value: string; status: number } = await this.page.evaluate(
      async (request) => {
        const response = await fetch(request.url, {
          headers: request.headers,
        });
        const value = await response.text();
        return { value: value, status: response.status };
      },
      request
    );
    this.logger.info(
      `SWAP STATUS:  ${result.status} | ${this.account.email} | SHIFT TAKED: ${this.account.shifts.length}`
    );
    if (result.status == 200) {
      const data: any = JSON.parse(result.value);
      this.logger.info(`SWAP FOUND:   ${data.length}`);
      return { swap: true, data: data };
    }
    if (result.status == 429) throw new ProxyBannedError();
    return { swap: true, data: [] };
  }

  /**
   * Starts the loop for finding shifts and swaps.
   * Continuously checks for available shifts and swaps based on the scheduled days.
   *
   * @returns {Promise<void>}
   */
  async startLoop(): Promise<void> {
    this.logger.info("Starting shift finder loop");
    this.createRequestsByDay();

    const shiftService = new ShiftService(
      this.baseRequests,
      this.page,
      this.account,
      this.logger
    );

    let keys = Object.keys(this.requests);
    let index = 0;

    try {
      while (true) {
        try {
          await sleep(this.config.requestDelay);
          await this.authService.checkIfLogged();

          const shiftsPromise = this.getShifts(
            this.requests[keys[index]].availableUnassignedShifts
          );
          const swapsPromise = this.getSwaps(
            this.requests[keys[index]].availableSwaps
          );

          const shifts = await shiftsPromise;
          const swaps = await swapsPromise;

          shiftService.handleShifts(shifts.data, shifts.swap);
          shiftService.handleShifts(swaps.data, swaps.swap);

          index = (index + 1) % keys.length;
        } catch (error) {
          this.logger.error("Error in loop iteration:", error);
          throw error;
        }
      }
    } catch (error) {
      this.logger.error("Error during loop execution:", error);
      throw error;
    }
  }
}
