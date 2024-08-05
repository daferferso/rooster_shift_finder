// Here we need to handle everything about shift (filter, take)

import { HTTPRequest, HTTPResponse } from "puppeteer-core";
import { Config, ShiftJson, UserMod } from "../interfaces/interface";
import moment, { Duration, Moment } from "moment-timezone";
import { User } from "@prisma/client";
import { saveShift } from "./dataService";
import { Logger } from "winston";
import {
  mockupSwapUrl,
  mockupUnassignedUrl,
  parseDateTimeCondition,
  parseDateTimeShift,
} from "./utilsService";
import { Agent } from "http";
import fetch from "node-fetch-commonjs";

let token = "";

export const handleRequest = async (
  req: HTTPRequest,
  config: Config,
  user: User,
  uniqueZoneIds: string,
  logger: Logger
) => {
  // This function intercept requests to mockup
  try {
    const url = req.url();
    let newUrl: string | undefined = undefined;

    if (url.includes("available_unassigned_shifts")) {
      token = req.headers()["authorization"] ?? "";
      newUrl = await mockupUnassignedUrl(url, config, user, uniqueZoneIds);
    }
    if (url.includes("available_swaps")) {
      token = req.headers()["authorization"] ?? "";
      newUrl = await mockupSwapUrl(url, config, user, uniqueZoneIds);
    }
    if (newUrl) {
      req.continue({ url: newUrl });
    } else {
      req.continue();
    }
  } catch (error) {
    logger.error(`Error processing request: ${error}`);
    req.continue();
    throw error;
  }
};

export const handleResponse = async (
  res: HTTPResponse,
  user: User,
  config: Config,
  proxyAgent: Agent,
  logger: Logger
) => {
  // This function intercept responses to get shifts from json data
  const url = res.url();
  const method = res.request().method();

  try {
    if (method === "OPTIONS" || !res.ok()) return;
    const contentType = res.headers()["content-type"];
    if (contentType && contentType.includes("application/json")) {
      if (url.includes("available_unassigned_shifts")) {
        const data = await res.json();
        logger.info(`STATUS: ${res.status()} | Shift: ${data.content.length}`);
        await handleShifts(
          data.content,
          false,
          user,
          config,
          token,
          proxyAgent,
          logger
        );
      } else if (url.includes("available_swaps")) {
        const data = await res.json();
        logger.info(`STATUS: ${res.status()} | Swaps: ${data.length}`);
        await handleShifts(data, true, user, config, token, proxyAgent, logger);
      }
    }
  } catch (error) {
    logger.error(`Error processing response: ${error}`);
    throw error;
  }
};

const handleShifts = async (
  shifts: ShiftJson[],
  swap = false,
  user: UserMod,
  config: Config,
  token: string,
  proxyAgent: Agent,
  logger: Logger
) => {
  // This function handle all shifts process, from evaluate & take them
  const tz = user?.Country?.timezone ?? "";
  if (!shifts) return false;
  for (const condition of config.conditions) {
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
      shift.start = shift.start ?? shift.start_at;
      shift.end = shift.end ?? shift.end_at;

      const { startShift, endShift } = await parseDateTimeShift(shift, tz);
      const diffShift = moment.duration(endShift.diff(startShift));

      if (!(await evalDuration(diffShift, minTime))) continue;
      if (
        !(await evalDate(startDateFilter, endDateFilter, startShift, endShift))
      )
        continue;
      if (
        !(await evalTime(startShift, endShift, startTimeFilter, endTimeFilter))
      )
        continue;

      let shiftResult = false;

      if (swap) {
        shiftResult = await fetchTakeSwapShift(
          shift,
          user,
          config,
          token,
          proxyAgent,
          logger
        );
      } else {
        shiftResult = await fetchTakeShift(
          shift,
          startShift,
          endShift,
          user,
          config,
          token,
          proxyAgent,
          logger
        );
      }

      if (!shiftResult) continue;
      return await saveShift(shift, user);
    }
  }
};

const evalDuration = async (
  diffShift: Duration,
  minTime: Duration
): Promise<boolean> => {
  // Evalute if shift is higher than min time
  if (diffShift.asMinutes() < minTime.asMinutes()) return false;
  return true;
};

const evalDate = async (
  startDateFilter: Moment,
  endDateFilter: Moment,
  startShift: Moment,
  endShift: Moment
): Promise<boolean> => {
  // Evaluate if shift is between startDate & endDate condition
  if (
    !(
      startDateFilter.isSameOrBefore(startShift, "day") &&
      endDateFilter.isSameOrAfter(endShift, "day")
    )
  )
    return false;
  return true;
};

const evalTime = async (
  startShift: Moment,
  endShift: Moment,
  startTimeFilter: Moment,
  endTimeFilter: Moment
): Promise<boolean> => {
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
};

const fetchTakeShift = async (
  shift: ShiftJson,
  start: Moment,
  end: Moment,
  user: User,
  config: Config,
  token: string,
  proxyAgent: Agent,
  logger: Logger
): Promise<boolean> => {
  // Fetch request to take the shift if it's type "Unassigned"
  const shift_id = shift.id ? shift.id : shift.shift_id;
  let url = `https://bo.usehurrier.com/api/rooster/v2/unassigned_shifts/${shift_id}/assign`;
  let startShift = start.tz("UTC").toISOString();
  let endShift = end.tz("UTC").toISOString();
  const body = JSON.stringify({
    id: shift_id,
    start_at: startShift,
    end_at: endShift,
    starting_point_id: shift.starting_point_id,
    employee_ids: [user.id],
  });

  let headers = { ...config.headers };
  headers.authorization = token;
  headers.Referer = "https://bo.usehurrier.com/app/rooster/web/shifts";

  try {
    const response = await fetch(url, {
      headers: headers,
      body: body,
      method: "POST",
      agent: proxyAgent,
    });
    if (response.status !== 202) {
      throw new Error(
        `Assigning Shift - Code - ${response.status} - ${user.email} - ${shift_id}`
      );
    }
    logger.info(
      `Assigning Shift - Code - ${response.status} - ${user.email} - ${shift_id}`
    );
  } catch (error) {
    logger.error(`Error to take shift - ${error}`);
    return false;
  }
  return true;
};

const fetchTakeSwapShift = async (
  shift: ShiftJson,
  user: User,
  config: Config,
  token: string,
  proxyAgent: Agent,
  logger: Logger
): Promise<boolean> => {
  // Fetch request to take the shift if it's type "Swap"
  const shift_id = shift.id ? shift.id : shift.shift_id;
  let url = `https://bo.usehurrier.com/api/rooster/v2/shifts/${shift_id}/swap`;
  let headers = { ...config.headers };
  headers.authorization = token;
  headers.Referer = "https://bo.usehurrier.com/app/rooster/web/shifts";
  try {
    const response = await fetch(url, {
      headers: headers,
      body: null,
      method: "PUT",
      agent: proxyAgent,
    });
    if (response.status !== 202) {
      throw new Error(
        `Assigning Swap - Code - ${response.status} - ${user.email} - ${shift_id}`
      );
    }
    logger.debug(
      `Assigning Swap - Code - ${response.status} - ${user.email} - ${shift_id}`
    );
  } catch (error) {
    logger.error(`Error to take shift - ${error}`);
    return false;
  }
  return true;
};
