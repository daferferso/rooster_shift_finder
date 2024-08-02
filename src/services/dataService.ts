// Here we need to handle database connection and save data functions

import { PrismaClient, Proxy, User, Zone } from "@prisma/client";
import path from "path";
import { ShiftJson } from "../interfaces/interface";

export const prisma = new PrismaClient({
  log: [],
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "utils/database.db")}`,
    },
  },
});

export const getUser = async (): Promise<User | null | undefined> => {
  // Get User from db
  const user: User | null | undefined = await prisma.user.findFirst();
  return user;
};

export const getZones = async (): Promise<Zone[] | null | undefined> => {
  // Get User from db
  const zones: Zone[] | null | undefined = await prisma.zone.findMany();
  if (!zones) return;
  return zones;
};

export const getProxies = async (
  user: User
): Promise<Proxy[] | null | undefined> => {
  const proxies: Proxy[] | null | undefined = await prisma.proxy.findMany({
    where: { userId: user.id },
  });
  return proxies;
};

export const saveShift = async (shift: ShiftJson, user: User) => {
  await prisma.shift.create({
    data: {
      id: shift.id,
      startAt: new Date(shift.start),
      endAt: new Date(shift.end),
      userId: user.id,
      zoneId: shift.starting_point_id,
    },
  });
};
