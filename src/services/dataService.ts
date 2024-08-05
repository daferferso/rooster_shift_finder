// Here we need to handle database connection and save data functions

import { PrismaClient, User } from "@prisma/client";
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

export const getUser = async (): Promise<UserMod | null | undefined> => {
  // Get User from db
  const user: User | null | undefined = await prisma.user.findFirst({
    include: {
      Country: true,
      proxies: true,
    },
  });
  return user;
};

export const saveShift = async (shift: ShiftJson, user: User) => {
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
