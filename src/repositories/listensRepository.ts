// listens.repository.ts
import { MediaItem } from "../types/media-types"
import { db } from "./db"

class ListensRepository {
  createOrUpsert(media: MediaItem) {
    // Check if the id already exists
    const existing = db.prepare(`SELECT id FROM listens WHERE id = ?`).get(media.id)

    if (existing) {
      // If it exists, increment total + update timestamp
      this.incrementListens(media.id)
      return
    }

    // Otherwise insert a new row
    const stmt = db.prepare(`
      INSERT INTO listens (
        uri, id, total, parent, title, subtitle, img, artist, type,
        format, isFolder, country, bitrate, favourite
      )
      VALUES (
        @uri, @id, 1, @parent, @title, @subtitle, @img, @artist, @type,
        @format, @isFolder, @country, @bitrate, @favourite
      )
    `)

    stmt.run({
      uri: media.uri,
      id: media.id ?? null,
      parent: media.parent ?? null,
      title: media.title,
      subtitle: media.subtitle,
      img: media.img ?? null,
      artist: media.artist ?? null,
      type: media.type,
      format: media.format ?? null,
      isFolder: media.isFolder ? 1 : 0,
      country: media.country ?? null,
      bitrate: media.bitrate ?? null,
      favourite: media.favourite ? 1 : 0,
    })
  }

  incrementListens(id: string) {
    const stmt = db.prepare(`
      UPDATE listens
      SET total = total + 1,
          last_listened_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run(id)
  }

  addDuration(id: string, seconds: number) {
    db.prepare(
      `
      UPDATE listens
      SET total_duration = total_duration + @seconds
      WHERE id = @id
    `,
    ).run({ id, seconds })
  }
}

export const listensRepository = new ListensRepository()
