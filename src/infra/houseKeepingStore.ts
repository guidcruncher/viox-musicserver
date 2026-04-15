import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

import { config } from "@/config"
import { db } from "@/infra/db"
import { logger } from "@/logger"
import { HouseKeepingStore, SqliteBackupResult } from "@/types"

export class SqliteHouseKeepingStore implements HouseKeepingStore {
  private readonly conn = db

  async vacuum(threshold: number = 30): Promise<void> {
    const row: any = db
      .prepare(
        `
  SELECT CAST(freelist_count AS REAL) / page_count * 100 AS free_page_ratio
  FROM pragma_freelist_count
  CROSS JOIN pragma_page_count`,
      )
      .get()

    if (row.free_page_ratio > threshold) {
      logger.info(
        `Free page ratio is ${row.free_page_ratio}% more than threshold of ${threshold}% so vacuuming`,
      )
      await db.exec("VACUUM")
    } else {
      logger.info(
        `Free page ratio is ${row.free_page_ratio}% less than threshold of ${threshold}% so vacuuming not needed, skipping.`,
      )
    }
  }

  async backup(): Promise<SqliteBackupResult | undefined> {
    try {
      const destinationPath: string = `${config.database}.bak`
      const sourcePath: string = config.database
      const start = performance.now()

      logger.info("sqlite backup start", { sourcePath, destinationPath })

      if (fs.existsSync(destinationPath)) {
        if (fs.existsSync(`${destinationPath}.001`)) fs.unlinkSync(`${destinationPath}.001`)
        fs.renameSync(destinationPath, `${destinationPath}.001`)
      }

      // Ensure destination directory exists
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true })

      // Open the source DB
      const rdb = new Database(sourcePath, { readonly: true })

      // Peruorm atomic SQLite backup
      await rdb.backup(destinationPath)

      const durationMs = performance.now() - start
      const bytes = fs.statSync(destinationPath).size

      logger.info("sqlite backup complete", { sourcePath, destinationPath, bytes, durationMs })

      return {
        source: sourcePath,
        destination: destinationPath,
        bytes,
        durationMs,
      }
    } catch (err) {
      logger.error("Error starting database backup", err)
      return undefined
    }
  }
}
