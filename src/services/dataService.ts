// Here we need to handle database connection and save data functions

import { PrismaClient, User, Zone } from "@prisma/client";
import path from "path";
import { ShiftJson } from "../interfaces/interface";

export const prisma = new PrismaClient({
  log: ["query"],
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


export const saveShift = async (shift: ShiftJson) =>{
  // await prisma.shift.create({
  //   data: {id: shift.id? shift.shift_id}
  // })
}