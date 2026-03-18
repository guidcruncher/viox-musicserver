import { MediaItem } from "../types/media-types"
import { db } from "./db"
import { MediaItemRecord } from "./types"

export abstract class BaseMediaItemRepository<T> {
  constructor(
    protected table: string,
    protected order: string,
  ) {}

  findAll(limit?: number): T[] {
    let sql = `SELECT * FROM ${this.table} ORDER BY ${this.order}`
    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    const stmt = db.prepare(sql)
    return stmt.all() as T[]
  }

  findById(id: string): T | null {
    const stmt = db.prepare(`SELECT * FROM ${this.table} WHERE id = ? `)
    return (stmt.get(id) as T) ?? null
  }

  deleteById(id: string): void {
    const stmt = db.prepare(`DELETE FROM ${this.table} WHERE id = ? `)
    stmt.run(id)
  }

  clear(): void {
    const stmt = db.prepare(`DELETE FROM ${this.table} `)
    stmt.run()
  }

  protected mapMediaItemToRecord(
    item: MediaItem,
    createdAt: string = new Date().toISOString(),
  ): MediaItemRecord {
    return {
      id: item.type == "spotify" ? String(item.uri) : String(item.id),
      title: item.title,
      subtitle: item.subtitle,
      artist: item.artist ?? "",
      img: item.img ?? "",
      type: item.type,
      uri: item.uri,
      format: item.format ?? "",
      is_folder: (item.isFolder ?? false) ? 1 : 0,
      country: item.country ?? "",
      bitrate: item.bitrate ?? "",
      created_at: createdAt,
    }
  }
}
