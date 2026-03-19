import { db } from "@/infra/db"
import type { LibraryStore, MediaItem, MediaSourceRef } from "@/types"

export class SqliteLibraryStore implements LibraryStore {
  private readonly conn = db

  async upsert(items: MediaItem[]): Promise<void> {
    try {
      const stmt = this.conn.prepare(`
      INSERT INTO media_items (
        id, source, item_type, source_id, parent_source_id, source_uri,
        title, subtitle, artist, album, image_url, duration_ms, is_live
      ) VALUES (
        @id, @source, @item_type, @source_id, @parent_source_id, @source_uri,
        @title, @subtitle, @artist, @album, @image_url, @duration_ms, @is_live
      )
      ON CONFLICT(id) DO UPDATE SET
        source = excluded.source,
        item_type = excluded.item_type,
        source_id = excluded.source_id,
        parent_source_id = excluded.parent_source_id,
        source_uri = excluded.source_uri,
        title = excluded.title,
        subtitle = excluded.subtitle,
        artist = excluded.artist,
        album = excluded.album,
        image_url = excluded.image_url,
        duration_ms = excluded.duration_ms,
        is_live = excluded.is_live,
        updated_at = CURRENT_TIMESTAMP
    `)

      const tx = this.conn.transaction((batch: MediaItem[]) => {
        for (const item of batch) stmt.run(this.toRow(item))
      })

      tx(items)
    } catch {
      return
    }
  }

  async remove(id: string): Promise<void> {
    this.conn.prepare(`DELETE FROM media_items WHERE id = ?`).run(id)
  }

  async get(id: string): Promise<MediaItem | undefined> {
    const row = this.conn.prepare(`SELECT * FROM media_items WHERE id = ?`).get(id)
    return row ? this.fromRow(row) : undefined
  }

  async list(): Promise<MediaItem[]> {
    const rows = this.conn.prepare(`SELECT * FROM media_items ORDER BY updated_at DESC`).all()
    return rows.map((r: any) => this.fromRow(r))
  }

  async findBySourceRef(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    const row = this.conn
      .prepare(
        `
        SELECT * FROM media_items
        WHERE source = ?
          AND item_type = ?
          AND source_id = ?
          AND COALESCE(parent_source_id, '') = COALESCE(?, '')
      `,
      )
      .get(ref.source, ref.itemType, ref.sourceId, ref.parentSourceId ?? null)

    return row ? this.fromRow(row) : undefined
  }

  async search(query: string): Promise<MediaItem[]> {
    const like = `%${query}%`
    const rows = this.conn
      .prepare(
        `
        SELECT * FROM media_items
        WHERE title LIKE @q
           OR artist LIKE @q
           OR album LIKE @q
      `,
      )
      .all({ q: like })

    return rows.map((r: any) => this.fromRow(r))
  }

  private toRow(item: MediaItem) {
    return {
      id: item.id,
      source: item.sourceRef.source,
      item_type: item.sourceRef.itemType,
      source_id: item.sourceRef.sourceId ?? "",
      parent_source_id: item.sourceRef.parentSourceId ?? null,
      source_uri: item.sourceRef.uri ?? null,
      title: item.title,
      subtitle: item.subtitle ?? null,
      artist: item.artist ?? null,
      album: item.album ?? null,
      image_url: item.imageUrl ?? null,
      duration_ms: item.durationMs ?? null,
      is_live: item.isLive ? 1 : 0, // <— FIXED
    }
  }

  private fromRow(row: any): MediaItem {
    const sourceRef: MediaSourceRef = {
      source: row.source,
      itemType: row.item_type,
      sourceId: row.source_id,
      parentSourceId: row.parent_source_id ?? undefined,
      uri: row.source_uri ?? undefined,
    }

    return {
      id: row.id,
      sourceRef,
      title: row.title,
      subtitle: row.subtitle ?? undefined,
      artist: row.artist ?? undefined,
      album: row.album ?? undefined,
      imageUrl: row.image_url ?? undefined,
      durationMs: row.duration_ms ?? undefined,
      isLive: row.is_live === 1,
    }
  }
}
