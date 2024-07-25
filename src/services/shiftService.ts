// Here we need to handle everything about shift (filter, take)

import { HTTPRequest, HTTPResponse } from "puppeteer";
import { Config, ShiftJson } from "../interfaces/interface";
import moment, { Duration, Moment } from "moment-timezone";
import { User } from "@prisma/client";
import { saveShift } from "./dataService";
import {
  mockupSwapUrl,
  mockupUnassignedUrl,
  parseDateTimeCondition,
  parseDateTimeShift,
} from "./utilsService";

export const handleRequest = async (
  req: HTTPRequest,
  config: Config,
  uniqueZoneIds: string
) => {
  const url = req.url();
  let newUrl: string | undefined = undefined;
  if (url.includes("available_unassigned_shifts")) {
    newUrl = await mockupUnassignedUrl(url, config, uniqueZoneIds);
  }
  if (url.includes("available_swaps")) {
    newUrl = await mockupSwapUrl(url, config, uniqueZoneIds);
  }
  if (newUrl) {
    req.continue({ url: newUrl });
  } else {
    req.continue();
  }
};

export const handleResponse = async (
  res: HTTPResponse,
  user: User,
  config: Config
) => {
  const url = res.url();
  const method = res.request().method();

  if (method === "OPTIONS" || !res.ok()) return;

  try {
    const contentType = res.headers()["content-type"];
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (url.includes("available_unassigned_shifts")) {
        console.log("Shifts:", data.content.length);
        await handleShifts(data.content, false, user, config);
      } else if (url.includes("available_swaps")) {
        console.log("Swaps:", data.length);
        await handleShifts(data, true, user, config);
      }
    }
  } catch (error) {
    console.error(`Error processing response from ${url}:`, error);
  }
};

const handleShifts = async (
  shifts: ShiftJson[],
  swap = false,
  user: User,
  config: Config
) => {
  const tz = "America/La_Paz";
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
        shiftResult = await fetchTakeSwapShift(shift, user, config);
      } else {
        shiftResult = await fetchTakeShift(
          shift,
          startShift,
          endShift,
          user,
          config
        );
      }

      if (shiftResult) {
        // logger.info(`Shift taked - ${this.email}`);
        await saveShift(shift);
        // logger.error(`Error saving shift - ${this.email} - ${error}`);
      } else {
        // logger.info(`Shift lost - ${this.email}`);
      }
      // return shiftResult;
    }
  }
};

const evalDuration = async (
  diffShift: Duration,
  minTime: Duration
): Promise<boolean> => {
  if (diffShift.asMinutes() < minTime.asMinutes()) return false;
  return true;
};

const evalDate = async (
  startDateFilter: Moment,
  endDateFilter: Moment,
  startShift: Moment,
  endShift: Moment
): Promise<boolean> => {
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
  config: Config
): Promise<boolean> => {
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

  const token =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLXJpZGVyLTAwMTItaWFtIiwidHlwIjoiSldUIn0.eyJpc3MiOiJsb2dpc3RpY3Mtand0LWlzc3VlciIsInN1YiI6MjE4NzksImF1ZCI6ImlhbS1sb2dpbi11cyIsImV4cCI6MTcyMTkzNzcwMSwiaWF0IjoxNzIxOTIzMzAxLCJqdGkiOiI4eDlzNW9yMHJxbnQ5ZzF4c3FiNm5vZTl2aG1ibTl5cmZpc2gwMm50Iiwic2NvcGUiOiJrZXltYWtlci51c2VyLmlhbS1sb2dpbi11cy5wYXNzd29yZCIsImVtYSI6InlhbWlsZWxwZW9yMTlAZ21haWwuY29tIiwidXNlcm5hbWUiOiIyMTg3OSIsIm5hbSI6IkpoYXNvbm4gamFtaWwgbW9udGVjaW5vcyB2aWxsYSIsInJvbCI6ImRyaXZlciIsInJvbGVzIjpbInJvb3N0ZXIuY291cmllciIsIm1vYmlsZS5jb3VyaWVyIiwicGF5bWVudHMuY291cmllciIsImNvZC5jb3VyaWVyIl0sImNvdW50cmllcyI6WyJibyJdfQ.htLgQBaBNAs5yMnBeiKz-mBPz03nCRL8kEjWtRtF7hOS3XdjSldzP8KXAGZUJxUy0gVFdrk6yrzvikvWbjmJ70eWRwCZQWCK3KLYe59w-6pVFFoHe0kOvMiiaF8ub4x3y1uQj4djXx-kGuZ8BNeR5A68-ye6BVREILaYeXvbdByI-w3UcItZNIMST0eqNAxFsPRblnzWnBm0ha0srvhOyUgOGBgJRFpQWq5QSTWbHo1v8e5GIu7Y-UuFL6D22eHCT6ZIJhvXxKjRhyoaJCr7gi-OjDuu8Dx58Hmfoa-JMiE8d2u4KDEIzSolsPumcZYIKUqFHQ4YdrPuaH1SAOa0KQ";
  let headers = { ...config.headers };
  headers.authorization = `Bearer ${token}`;
  headers.Referer = "https://bo.usehurrier.com/app/rooster/web/shifts";

  try {
    const response = await fetch(url, {
      headers: headers,
      body: body,
      method: "POST",
      // agent: this.proxyAgent,
    });
    if (response.status !== 202) {
      throw new Error(
        `Assigning Shift - Code - ${response.status} - ${user.email}`
      );
    }
    console.log(`Assigning Shift - Code - ${response.status} - ${user.email}`);
    const data = await response.json();
    console.log("Shift tomado:", data);
    return true;
  } catch (error) {
    // logger.error(error.message);
    console.error("Error al tomar turno", error);
    return false;
  }
  // return true;
};

const fetchTakeSwapShift = async (
  shift: ShiftJson,
  user: User,
  config: Config
): Promise<boolean> => {
  const shift_id = shift.id ? shift.id : shift.shift_id;
  let url = `https://bo.usehurrier.com/api/rooster/v2/shifts/${shift_id}/swap`;
  let headers = { ...config.headers };
  const token =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLXJpZGVyLTAwMTItaWFtIiwidHlwIjoiSldUIn0.eyJpc3MiOiJsb2dpc3RpY3Mtand0LWlzc3VlciIsInN1YiI6MjE4NzksImF1ZCI6ImlhbS1sb2dpbi11cyIsImV4cCI6MTcyMTkzNzcwMSwiaWF0IjoxNzIxOTIzMzAxLCJqdGkiOiI4eDlzNW9yMHJxbnQ5ZzF4c3FiNm5vZTl2aG1ibTl5cmZpc2gwMm50Iiwic2NvcGUiOiJrZXltYWtlci51c2VyLmlhbS1sb2dpbi11cy5wYXNzd29yZCIsImVtYSI6InlhbWlsZWxwZW9yMTlAZ21haWwuY29tIiwidXNlcm5hbWUiOiIyMTg3OSIsIm5hbSI6IkpoYXNvbm4gamFtaWwgbW9udGVjaW5vcyB2aWxsYSIsInJvbCI6ImRyaXZlciIsInJvbGVzIjpbInJvb3N0ZXIuY291cmllciIsIm1vYmlsZS5jb3VyaWVyIiwicGF5bWVudHMuY291cmllciIsImNvZC5jb3VyaWVyIl0sImNvdW50cmllcyI6WyJibyJdfQ.htLgQBaBNAs5yMnBeiKz-mBPz03nCRL8kEjWtRtF7hOS3XdjSldzP8KXAGZUJxUy0gVFdrk6yrzvikvWbjmJ70eWRwCZQWCK3KLYe59w-6pVFFoHe0kOvMiiaF8ub4x3y1uQj4djXx-kGuZ8BNeR5A68-ye6BVREILaYeXvbdByI-w3UcItZNIMST0eqNAxFsPRblnzWnBm0ha0srvhOyUgOGBgJRFpQWq5QSTWbHo1v8e5GIu7Y-UuFL6D22eHCT6ZIJhvXxKjRhyoaJCr7gi-OjDuu8Dx58Hmfoa-JMiE8d2u4KDEIzSolsPumcZYIKUqFHQ4YdrPuaH1SAOa0KQ";
  headers.authorization = `Bearer ${token}`;
  headers.Referer = "https://bo.usehurrier.com/app/rooster/web/shifts";
  try {
    const response = await fetch(url, {
      headers: headers,
      body: null,
      method: "PUT",
      // agent: this.proxyAgent,
    });
    if (response.status !== 202) {
      throw new Error(
        `Assigning Swap - Code - ${response.status} - ${user.email}`
      );
    }
    console.debug(`Assigning Swap - Code - ${response.status} - ${user.email}`);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
