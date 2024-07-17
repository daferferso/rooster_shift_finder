// Here we need to handle database connection and save data functions

import { PrismaClient } from "@prisma/client";
import path from "path";

export const prisma = new PrismaClient({
  log: [],
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), "utils/database.db")}`,
    },
  },
});
