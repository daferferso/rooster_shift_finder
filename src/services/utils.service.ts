import moment, { Moment } from "moment-timezone";
import { Account, Condition, Shift } from "../interfaces/interfaces";

/**
 * Utility function to pause execution for a specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>}
 */
export const sleep = async (ms: number) => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mockups the URL for unassigned shifts by adding new query parameters based on the provided parameters.
 *
 * @param {Moment} startDay - The day to start the query from.
 * @param {string} url - The original URL to mockup.
 * @param {Account} user - The user account information.
 * @param {string} uniqueZoneIds - A string of unique starting point IDs.
 * @returns {string} - The modified URL with new query parameters.
 */
export const mockupUnassignedUrl = (
  startDay: Moment,
  url: string,
  user: Account,
  uniqueZoneIds: string
): string => {
  let newUrl = url.split("?")[0];
  const params = {
    starting_point_ids: uniqueZoneIds,
    date: startDay.toISOString().substring(0, 10),
    start_hour: "00:00",
    end_hour: "23:59",
    order_by: "LONGEST_FIRST",
    only_high_demand: String(false),
    city_id: String(user.country.cityId),
    with_time_zone: user.country.tz,
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

/**
 * Mockups the URL for swapping shifts by adding new query parameters.
 *
 * @param {Moment} startDay - The day to start the swap from.
 * @param {string} url - The original URL to mockup.
 * @param {Account} user - The user account information.
 * @param {string} uniqueZoneIds - A string of unique starting point IDs.
 * @returns {string} - The modified URL with new query parameters.
 */
export const mockupSwapUrl = (
  startDay: Moment,
  url: string,
  user: Account,
  uniqueZoneIds: string
): string => {
  let newUrl = url.split("?")[0];
  const startAt = startDay.clone().toISOString();
  const endAt = startDay
    .clone()
    .add(1, "days")
    .subtract(1, "milliseconds")
    .toISOString();
  const params = {
    start_at: startAt,
    end_at: endAt,
    starting_point_ids: uniqueZoneIds,
    city_id: String(user.country.cityId),
    with_time_zone: user.country.tz,
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

/**
 * Parses the date and time conditions from a condition object.
 *
 * @param {Condition} condition - The condition object containing date and time information.
 * @param {string} tz - The timezone to apply.
 * @returns {Promise<{ startDateFilter: Moment; endDateFilter: Moment; startTimeFilter: Moment; endTimeFilter: Moment; minTime: Duration }>}
 * - An object containing parsed date and time filters.
 */
export const parseDateTimeCondition = async (
  condition: Condition,
  tz: string
) => {
  const startDateFilter = moment
    .tz(condition.startDate, "YYYY-MM-DD", tz)
    .startOf("day");
  const endDateFilter = moment
    .tz(condition.endDate, "YYYY-MM-DD", tz)
    .endOf("day");
  const startTimeFilter = moment.tz(condition.startTime, "HH:mm:ss", tz);
  const endTimeFilter = moment.tz(condition.endTime, "HH:mm:ss", tz);
  const minTime = moment.duration({
    minutes: condition.minTime.minutes,
    hours: condition.minTime.hours,
  });

  return {
    startDateFilter,
    endDateFilter,
    startTimeFilter,
    endTimeFilter,
    minTime,
  };
};

/**
 * Parses the start and end times of a shift based on its information.
 *
 * @param {Shift} shift - The shift object to parse.
 * @param {string} tz - The timezone to apply.
 * @returns {Promise<{ startShift: Moment; endShift: Moment }>}
 * - An object containing parsed start and end times of the shift.
 */
export const parseDateTimeShift = async (
  shift: Shift,
  tz: string
): Promise<{ startShift: Moment; endShift: Moment }> => {
  const startShift = moment.tz(shift.start ? shift.start : shift.start_at, tz);
  const endShift = moment.tz(shift.end ? shift.end : shift.end_at, tz);
  return { startShift, endShift };
};
