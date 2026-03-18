import Database from "better-sqlite3"

import { getConfig } from "@/config"

export const db: ReturnType<typeof Database> = new Database(getConfig("database"), {
    fileMustExist: true,
  })

db.pragma("foreign_keys = ON");

export type SqliteDb = typeof db;
