import { db } from "@/infra/db"
import type { LibraryStore, MediaItem, Playlist, PlaylistStore } from "@/types"
import { makeVioxId } from "./makeVioxId"

export class SqlitePlaylistStore implements PlaylistStore {
  private readonly conn = db

  constructor(private readonly library: LibraryStore) {}

  async create(name: string, description?: string): Promise<string> {
    const id = makeVioxId(crypto.randomUUID(), "playlist")
    this.conn
      .prepare(
        `
        INSERT INTO playlists (id, name, description, source, total_items)
        VALUES (?, ?, ?, 'local', 0)
      `,
      )
      .run(id, name, description ?? null)
    return id
  }

  async rename(id: string, name: string): Promise<void> {
    this.conn
      .prepare(`UPDATE playlists SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(name, id)
  }

  async updateDescription(id: string, description: string): Promise<void> {
    this.conn
      .prepare(`UPDATE playlists SET description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(description, id)
  }

  async updateImage(id: string, imageUrl: string): Promise<void> {
    this.conn
      .prepare(`UPDATE playlists SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(imageUrl, id)
  }

  async delete(id: string): Promise<void> {
    this.conn.prepare(`DELETE FROM playlists WHERE id = ?`).run(id)
  }

  async get(id: string): Promise<Playlist | undefined> {
    const row = this.conn.prepare(`SELECT * FROM playlists WHERE id = ?`).get(id)
    return row ? this.fromRow(row) : undefined
  }

  async list(): Promise<Playlist[]> {
    const rows = this.conn.prepare(`SELECT * FROM playlists`).all()
    return rows.map((r: any) => this.fromRow(r))
  }

  async addItem(playlistId: string, itemId: string): Promise<void> {
    await this.addItems(playlistId, [itemId])
  }

  async addItems(playlistId: string, itemIds: string[]): Promise<void> {
    const getMaxPos = this.conn.prepare(
      `SELECT MAX(position) as maxPos FROM playlist_items WHERE playlist_id = ?`,
    )
    const insertStmt = this.conn.prepare(`
      INSERT OR IGNORE INTO playlist_items (playlist_id, media_item_id, position)
      VALUES (@playlist_id, @media_item_id, @position)
    `)
    const updateCount = this.conn.prepare(`
      UPDATE playlists
      SET total_items = (
        SELECT COUNT(*) FROM playlist_items WHERE playlist_id = @playlist_id
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = @playlist_id
    `)

    const tx = this.conn.transaction((ids: string[]) => {
      const row: any = getMaxPos.get(playlistId)
      let pos = (row?.maxPos ?? -1) + 1

      for (const itemId of ids) {
        insertStmt.run({
          playlist_id: playlistId,
          media_item_id: itemId,
          position: pos++,
        })
      }

      updateCount.run({ playlist_id: playlistId })
    })

    tx(itemIds)
  }

  async removeItem(playlistId: string, itemId: string): Promise<void> {
    const getPos = this.conn.prepare(
      `SELECT position FROM playlist_items WHERE playlist_id = ? AND media_item_id = ?`,
    )
    const row = getPos.get(playlistId, itemId) as any
    if (!row) return

    const pos = row.position

    const deleteStmt = this.conn.prepare(
      `DELETE FROM playlist_items WHERE playlist_id = ? AND media_item_id = ?`,
    )
    const shiftStmt = this.conn.prepare(`
      UPDATE playlist_items
      SET position = position - 1
      WHERE playlist_id = @playlist_id AND position > @pos
    `)
    const updateCount = this.conn.prepare(`
      UPDATE playlists
      SET total_items = (
        SELECT COUNT(*) FROM playlist_items WHERE playlist_id = @playlist_id
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = @playlist_id
    `)

    const tx = this.conn.transaction(() => {
      deleteStmt.run(playlistId, itemId)
      shiftStmt.run({ playlist_id: playlistId, pos })
      updateCount.run({ playlist_id: playlistId })
    })

    tx()
  }

  async clearItems(playlistId: string): Promise<void> {
    const tx = this.conn.transaction(() => {
      this.conn.prepare(`DELETE FROM playlist_items WHERE playlist_id = ?`).run(playlistId)
      this.conn
        .prepare(
          `UPDATE playlists
           SET total_items = 0, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
        )
        .run(playlistId)
    })

    tx()
  }

  async reorderItem(playlistId: string, itemId: string, newPosition: number): Promise<void> {
    const row: any = this.conn
      .prepare(`SELECT position FROM playlist_items WHERE playlist_id = ? AND media_item_id = ?`)
      .get(playlistId, itemId)
    if (!row) return

    const oldPos = row.position
    if (oldPos === newPosition) return

    const tx = this.conn.transaction(() => {
      if (newPosition > oldPos) {
        this.conn
          .prepare(
            `
            UPDATE playlist_items
            SET position = position - 1
            WHERE playlist_id = @playlist_id
              AND position > @oldPos
              AND position <= @newPos
          `,
          )
          .run({ playlist_id: playlistId, oldPos, newPos: newPosition })
      } else {
        this.conn
          .prepare(
            `
            UPDATE playlist_items
            SET position = position + 1
            WHERE playlist_id = @playlist_id
              AND position >= @newPos
              AND position < @oldPos
          `,
          )
          .run({ playlist_id: playlistId, oldPos, newPos: newPosition })
      }

      this.conn
        .prepare(
          `
          UPDATE playlist_items
          SET position = @newPos
          WHERE playlist_id = @playlist_id AND media_item_id = @item_id
        `,
        )
        .run({
          playlist_id: playlistId,
          item_id: itemId,
          newPos: newPosition,
        })
    })

    tx()
  }

  async getItems(playlistId: string): Promise<MediaItem[]> {
    const rows = this.conn
      .prepare(
        `
        SELECT m.*
        FROM playlist_items pi
        JOIN media_items m ON m.id = pi.media_item_id
        WHERE pi.playlist_id = ?
        ORDER BY pi.position ASC
      `,
      )
      .all(playlistId)

    return rows.map((r: any) =>
      (this.library as any).fromRow ? (this.library as any).fromRow(r) : (r as MediaItem),
    )
  }

  private fromRow(row: any): Playlist {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      imageUrl: row.image_url ?? undefined,
      source: row.source,
      sourceId: row.source_id ?? undefined,
      sourceUri: row.source_uri ?? undefined,
      totalItems: row.total_items ?? 0,
    }
  }
}
