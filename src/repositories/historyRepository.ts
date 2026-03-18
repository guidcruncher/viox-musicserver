import { MediaItem } from "../types/media-types"
import { BaseMediaItemRepository } from "./baseMediaItemRepository"
import { db } from "./db"
import { MediaItemRecord } from "./types"

class HistoryRepository extends BaseMediaItemRepository<MediaItemRecord> {
  constructor() {
    super("history", "created_at DESC")
  }

  create(item: MediaItem): void {
    if (item.type == "episode") return
    const stmt = db.prepare(`
      INSERT INTO history (
        id, title, subtitle, artist, img, type, uri,
        format, is_folder, country, bitrate
      ) VALUES (
        @id, @title, @subtitle, @artist, @img, @type, @uri,
        @format, @is_folder, @country, @bitrate
      )
    `)

    stmt.run(this.mapMediaItemToRecord(item))
  }

  getLatest(): MediaItem | null {
    const stmt = db.prepare(`
      SELECT *
      FROM history
      ORDER BY created_at DESC
      LIMIT 1
    `)

    return (stmt.get() as MediaItem) ?? null
  }

  findAllHistory(limit?: number): MediaItem[] {
    let sql = `SELECT
        id,
        title,
        subtitle,
        artist,
        img,
        type,
        uri,
        format,
        is_folder,
        country,
        bitrate,
        MAX(created_at) AS max_created_at
    FROM history
    GROUP BY id
    ORDER BY max_created_at DESC`

    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    sql += ";"

    const stmt = db.prepare(sql)
    return stmt.all() as MediaItem[]
  }
}

export const historyRepository = new HistoryRepository()
