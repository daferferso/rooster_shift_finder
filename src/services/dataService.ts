// Here we need to handle database connection and save data functions

import { PrismaClient } from "@prisma/client";
import path from "path";
import { ShiftJson, UserMod } from "../interfaces/interface";

export const prisma = new PrismaClient({
  log: [],
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "utils/database.db")}`,
    },
  },
});

export const getUser = async (): Promise<UserMod | null> => {
  // Get User from db
  const user: UserMod | null = await prisma.user.findFirst({
    include: {
      City: {
        include: {
          Country: true,
        },
      },
      proxies: true,
    },
  });
  return user;
};

export const saveShift = async (shift: ShiftJson, user: UserMod) => {
  // Insert shift into db
  await prisma.shift.create({
    data: {
      shiftId: shift.id,
      startAt: new Date(shift.start),
      endAt: new Date(shift.end),
      userId: user.id,
      zoneId: shift.starting_point_id,
    },
  });
};
