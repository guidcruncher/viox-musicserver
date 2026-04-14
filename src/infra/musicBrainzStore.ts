import { db } from "@/infra/db"
import { MusicBrainzStore } from "@/types"

export interface MusicBrainzMapRow {
  id?: number
  isrc: string
  key: string
  mbid: string
}

export class SqliteMusicBrainzStore implements MusicBrainzStore {
  private readonly conn = db

  /**
   * Fetches a specific mapping based on the unique pair of ISRC and Key.
   */
  getMapping(isrc: string, key: string): MusicBrainzMapRow | undefined {
    return this.conn
      .prepare(`SELECT * FROM musicbrainz_idmap WHERE isrc = ? AND key = ?`)
      .get(isrc, key) as MusicBrainzMapRow | undefined
  }

  getMappingsByIsrc(isrc: string): MusicBrainzMapRow[] {
    return this.conn
      .prepare(`SELECT * FROM musicbrainz_idmap WHERE isrc = ?`)
      .all(isrc) as MusicBrainzMapRow[]
  }

  /**
   * Upserts based on the unique constraint (isrc, key).
   * If the pair exists, it updates the mbid.
   */
  upsert(isrc: string, key: string, mbid: string): void {
    this.conn
      .prepare(
        `
        INSERT INTO musicbrainz_idmap (isrc, key, mbid)
        VALUES (?, ?, ?)

        ON CONFLICT(isrc, key) DO UPDATE SET
          mbid = excluded.mbid
      `,
      )
      .run(isrc, key, mbid)
  }

  /**
   * Performance-optimized batch upsert for bulk metadata synchronization.
   */
  upsertBatch(items: Omit<MusicBrainzMapRow, "id">[]): void {
    const stmt = this.conn.prepare(`
      INSERT INTO musicbrainz_idmap (isrc, key, mbid)
      VALUES (?, ?, ?)
      ON CONFLICT(isrc, key) DO UPDATE SET
        mbid = excluded.mbid
    `)

    const tx = this.conn.transaction((items: Omit<MusicBrainzMapRow, "id">[]) => {
      for (const item of items) {
        stmt.run(item.isrc, item.key, item.mbid)
      }
    })

    tx(items)
  }

  /**
   * Deletes a specific mapping.
   */
  removeMapping(isrc: string, key: string): void {
    this.conn.prepare(`DELETE FROM musicbrainz_idmap WHERE isrc = ? AND key = ?`).run(isrc, key)
  }
}
