import Database from "better-sqlite3"

import { config } from "@/config"

export const db: ReturnType<typeof Database> = new Database(config.database, {
  fileMustExist: true,
})

db.pragma("foreign_keys = ON")
