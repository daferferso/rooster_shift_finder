import moment, { Moment } from "moment-timezone";
import { Condition, Config, ShiftJson } from "../interfaces/interface";

export const sleep = async (ms: number) => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockupUnassignedUrl = async (
  url: string,
  config: Config,
  uniqueZoneIds: string
): Promise<string> => {
  let newUrl = url.split("?")[0];
  const params = {
    starting_point_ids: uniqueZoneIds,
    date: config.startDay,
    start_hour: "00:00",
    end_hour: "23:59",
    order_by: "LONGEST_FIRST",
    only_high_demand: String(false),
    city_id: String(1),
    with_time_zone: "America/La_Paz",
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

export const mockupSwapUrl = async (
  url: string,
  config: Config,
  uniqueZoneIds: string
): Promise<string> => {
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
    with_time_zone: "America/La_Paz",
  };
  const queryString = new URLSearchParams(params).toString();
  return `${newUrl}?${queryString}`;
};

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

export const parseDateTimeShift = async (
  shift: ShiftJson,
  tz: string
): Promise<{ startShift: Moment; endShift: Moment }> => {
  const startShift = shift.start_at
    ? moment.utc(shift.start_at).tz(tz)
    : moment.tz(shift.start, tz);
  const endShift = shift.end_at
    ? moment.utc(shift.end_at).tz(tz)
    : moment.tz(shift.end, tz);
  return { startShift, endShift };
};
