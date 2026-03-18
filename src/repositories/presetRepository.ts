import { MediaItem } from "../types/media-types"
import { BaseMediaItemRepository } from "./baseMediaItemRepository"
import { db } from "./db"
import { MediaItemRecord } from "./types"

class PresetRepository extends BaseMediaItemRepository<MediaItemRecord> {
  constructor() {
    super("presets", "title ASC")
  }

  setFavouriteFlag(item: MediaItem | MediaItemRecord): MediaItem | MediaItemRecord {
    const presets = this.findAll()
    if (presets.find((pr: any) => pr.uri == item.uri)) {
      item.favourite = true
    } else {
      item.favourite = false
    }
    return item
  }

  setFavouriteFlagOnList(items: MediaItem[] | MediaItemRecord[]): MediaItem[] | MediaItemRecord[] {
    const presets = this.findAll()
    return items.map((t: any) => {
      if (presets.find((pr: any) => pr.uri == t.uri)) {
        t.favourite = true
      } else {
        t.favourite = false
      }
      return t
    })
  }

  create(item: MediaItem): void {
    const stmt = db.prepare(`
      INSERT INTO presets (
        id, title, subtitle, artist, img, type, uri,
        format, is_folder, country, bitrate
      ) VALUES (
        @id, @title, @subtitle, @artist, @img, @type, @uri,
        @format, @is_folder, @country, @bitrate
      )
    `)

    stmt.run(this.mapMediaItemToRecord(item))
  }
}

export const presetRepository = new PresetRepository()
