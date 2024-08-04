import moment, { Moment } from "moment-timezone";
import { Condition, Config, ShiftJson, UserMod } from "../interfaces/interface";

export const sleep = async (ms: number) => {
  // This is an util function to sleep expressions in milliseconds
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockupUnassignedUrl = async (
  url: string,
  config: Config,
  user: UserMod,
  uniqueZoneIds: string
): Promise<string> => {
  // This function mockup the URL from request intercepted & return with new QueryParams
  let newUrl = url.split("?")[0];
  const params = {
    starting_point_ids: uniqueZoneIds,
    date: config.startDay,
    start_hour: "00:00",
    end_hour: "23:59",
    order_by: "LONGEST_FIRST",
    only_high_demand: String(false),
    city_id: String(1),
    with_time_zone: user.Country?.timezone?? "",
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

export const mockupSwapUrl = async (
  url: string,
  config: Config,
  user: UserMod,
  uniqueZoneIds: string
): Promise<string> => {
  // This function mockup the URL from request intercepted & return with new QueryParams
  const day: Moment = moment(config.startDay);
  let newUrl = url.split("?")[0];
  const startAt = day.clone().toISOString();
  const endAt = day
    .clone()
    .add(1, "days")
    .subtract(1, "milliseconds")
    .toISOString();
  const params = {
    start_at: startAt,
    end_at: endAt,
    starting_point_ids: uniqueZoneIds,
    city_id: String(1),
    with_time_zone: user.Country?.timezone?? "",
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

export const parseDateTimeCondition = async (
  condition: Condition,
  tz: string
) => {
  // This function parse DateTime condition from config.json
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

export const parseDateTimeShift = async (
  shift: ShiftJson,
  tz: string
): Promise<{ startShift: Moment; endShift: Moment }> => {
  // This function parse Shift DateTime
  const startShift = moment.tz(shift.start, tz);
  const endShift = moment.tz(shift.end, tz);
  return { startShift, endShift };
};
