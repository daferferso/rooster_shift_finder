import { Page } from "puppeteer-core";
import { Account, Shift } from "../interfaces/interfaces";
import moment, { Duration, Moment } from "moment-timezone";
import { Logger } from "winston";
import { parseDateTimeCondition, parseDateTimeShift, sleep } from "./utils.service";
import { DataService } from "./data.service";

/**
 * Service class for managing shifts for an account in a Puppeteer browser instance.
 */
export class ShiftService {
  private baseRequests: any;
  private page: Page;
  private account: Account;
  private logger: Logger;
  private dataService: DataService;

  /**
   * Constructs a ShiftService instance.
   *
   * @param {any} baseRequests - Base requests for API calls.
   * @param {Page} page - The Puppeteer Page instance.
   * @param {Account} account - The account associated with the shifts.
   * @param {Logger} logger - Logger instance for logging information.
   */
  constructor(baseRequests: any, page: Page, account: Account, logger: Logger) {
    this.baseRequests = baseRequests;
    this.page = page;
    this.account = account;
    this.logger = logger;
    this.dataService = new DataService();
  }

  /**
   * Handles the processing of shifts based on the account's conditions.
   *
   * @param {Shift[]} shifts - Array of shifts to handle.
   * @param {boolean} swap - Indicates if the operation is a swap.
   * @returns {Promise<void>}
   */
  public async handleShifts(shifts: Shift[], swap: boolean = false): Promise<void> {
    const tz = this.account.country.tz;
    if (!shifts) return;

    for (const condition of this.account.conditions) {
      const {
        startDateFilter,
        endDateFilter,
        startTimeFilter,
        endTimeFilter,
        minTime,
      } = await parseDateTimeCondition(condition, tz);

      const filteredShifts = shifts.filter((shift) =>
        condition.placesId.includes(shift.starting_point_id)
      );

      for (const shift of filteredShifts) {
        shift.id = shift.id ?? shift.shift_id;
        const { startShift, endShift } = await parseDateTimeShift(shift, tz);
        const diffShift = moment.duration(endShift.diff(startShift));

        if (!(await this.evalDuration(diffShift, minTime))) continue;

        if (
          !(await this.evalDate(
            startDateFilter,
            endDateFilter,
            startShift,
            endShift
          ))
        )
          continue;

        if (
          !(await this.evalTime(
            startShift,
            endShift,
            startTimeFilter,
            endTimeFilter
          ))
        )
          continue;

        let shiftResult = false;

        if (swap) {
          shiftResult = await this.fetchTakeSwapShift(shift);
        } else {
          shiftResult = await this.fetchTakeShift(shift, startShift, endShift);
        }

        if (!shiftResult) continue;

        this.account.shifts.push(shift);
        this.dataService.saveData({ account: this.account });

        this.logger.info(
          `Shift taken: ${shift.start ? shift.start : shift.start_at} - ${shift.end ? shift.end : shift.end_at
          } - ${this.account.email}`
        );

        return;
      }
    }
  }

  /**
   * Evaluates if the duration of the shift meets the minimum required time.
   *
   * @param {Duration} diffShift - Duration of the shift.
   * @param {Duration} minTime - Minimum required duration.
   * @returns {Promise<boolean>}
   */
  private async evalDuration(
    diffShift: Duration,
    minTime: Duration
  ): Promise<boolean> {
    if (diffShift.asMinutes() < minTime.asMinutes()) return false;
    return true;
  }

  /**
   * Evaluates if the shift's dates fall within the allowed date range.
   *
   * @param {Moment} startDateFilter - Start date filter.
   * @param {Moment} endDateFilter - End date filter.
   * @param {Moment} startShift - Start time of the shift.
   * @param {Moment} endShift - End time of the shift.
   * @returns {Promise<boolean>}
   */
  private async evalDate(
    startDateFilter: Moment,
    endDateFilter: Moment,
    startShift: Moment,
    endShift: Moment
  ): Promise<boolean> {
    if (
      !(
        startDateFilter.isSameOrBefore(startShift, "day") &&
        endDateFilter.isSameOrAfter(endShift, "day")
      )
    )
      return false;
    return true;
  }

  /**
   * Evaluates if the shift's times are within the allowed time range.
   *
   * @param {Moment} startShift - Start time of the shift.
   * @param {Moment} endShift - End time of the shift.
   * @param {Moment} startTimeFilter - Start time filter.
   * @param {Moment} endTimeFilter - End time filter.
   * @returns {Promise<boolean>}
   */
  private async evalTime(
    startShift: Moment,
    endShift: Moment,
    startTimeFilter: Moment,
    endTimeFilter: Moment
  ): Promise<boolean> {
    // Evaluate if shift is between startTime & endTime condition
    const startTimeCondition = startShift.clone().startOf("day").add({
      hours: startTimeFilter.hours(),
      minutes: startTimeFilter.minutes(),
      seconds: startTimeFilter.seconds(),
    });
    let endTimeCondition = startShift.clone().startOf("day").add({
      hours: endTimeFilter.hours(),
      minutes: endTimeFilter.minutes(),
      seconds: endTimeFilter.seconds(),
    });

    if (endTimeFilter.isBefore(startTimeFilter)) {
      endTimeCondition.add(1, "day");
    }

    if (startTimeCondition.isBefore(endTimeCondition)) {
      if (
        !(
          startShift.isSameOrAfter(startTimeCondition) &&
          endShift.isSameOrBefore(endTimeCondition)
        )
      ) {
        return false;
      }
    } else {
      if (
        !(
          (startShift.isSameOrAfter(startTimeCondition) ||
            startShift.isSameOrBefore(endTimeCondition)) &&
          (endShift.isSameOrAfter(startTimeCondition) ||
            endShift.isSameOrBefore(endTimeCondition))
        )
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Fetches and takes the specified shift.
   *
   * @param {Shift} shift - The shift to take.
   * @param {Moment} start - Start time of the shift.
   * @param {Moment} end - End time of the shift.
   * @returns {Promise<boolean>} - Indicates success or failure.
   */
  private async fetchTakeShift(
    shift: Shift,
    start: Moment,
    end: Moment
  ): Promise<boolean> {
    try {

      const url = `https://${this.account.country.code}.usehurrier.com/api/rooster/v2/unassigned_shifts/${shift.id}/assign`;
      const startShift = start.tz("UTC").toISOString();
      const endShift = end.tz("UTC").toISOString();
      const body = JSON.stringify({
        id: shift.id,
        start_at: startShift,
        end_at: endShift,
        starting_point_id: shift.starting_point_id,
        employee_ids: [this.account.id],
      });

      let headers = { ...this.baseRequests.availableUnassignedShifts.headers };
      headers["content-type"] = "application/json";

      const startTime = performance.now();

      const result = await this.page.evaluate(
        async ({ url, headers, body }) => {
          const res = await fetch(url, {
            headers: headers,
            body: body,
            method: "POST",
          });
          const data = await res.text();
          return { data: data, status: res.status };
        },
        { url, headers, body }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      this.logger.info(`Fetch duration: ${duration}`);
      this.logger.info(`Response: ${result.data}`);

      if (result.status !== 202) {
        throw new Error(
          `Assigning Shift - Code - ${result.status} - ${this.account.email} - ${shift.id}`
        );
      }
      this.logger.info(
        `Assigning Shift - Code - ${result.status} - ${this.account.email} - ${shift.id}`
      );
    } catch (error) {
      this.logger.error(`Error taking shift - ${error}`);
      return false;
    }
    return true;
  }

  /**
   * Fetches and takes a swap for the specified shift.
   *
   * @param {Shift} shift - The shift to swap.
   * @returns {Promise<boolean>} - Indicates success or failure.
   */
  private async fetchTakeSwapShift(shift: Shift): Promise<boolean> {
    try {
      const url = `https://${this.account.country.code}.usehurrier.com/api/rooster/v2/shifts/${shift.id}/swap`;
      let headers = { ...this.baseRequests.availableSwaps.headers };

      const startTime = performance.now();

      const result = await this.page.evaluate(
        async ({ url, headers }) => {
          const res = await fetch(url, {
            headers: headers,
            method: "PUT",
          });
          const data = await res.text();
          return { data: data, status: res.status };
        },
        { url, headers }
      );

      const endTime = performance.now();
      const duration = endTime - startTime;
      this.logger.info(`Fetch duration: ${duration}`);

      this.logger.info(`Response: ${result.data}`);

      if (result.status !== 202) {
        throw new Error(
          `Assigning Swap - Code - ${result.status} - ${this.account.email} - ${shift.id}`
        );
      }
      this.logger.info(
        `Assigning Swap - Code - ${result.status} - ${this.account.email} - ${shift.id}`
      );
    } catch (error) {
      this.logger.error(`Error taking shift - ${error}`);
      return false;
    }
    return true;
  }
}
