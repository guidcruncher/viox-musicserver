import { db } from "@/infra/db"
import { musicBrainzClient } from "@/infra/musicbrainz/musicBrainzClient"
import { logger } from "@/logger"
import type { AudioSourceItemType, MediaItem, MediaItemStore, MediaSourceRef } from "@/types"
import { toArray } from "@/utils"

export class SqliteRadioStore implements MediaItemStore {
  private readonly conn = db

  async upsert(items: MediaItem[]): Promise<void> {
    try {
      const stmt = this.conn.prepare(`
INSERT INTO radio_items (
  id, source, item_type, source_id, parent_source_id, source_uri,
  title, subtitle, artist, album, image_url, duration_ms, is_live, mbid, isrc
)
SELECT 
  @id, @source, @item_type, @source_id, @parent_source_id, @source_uri,
  @title, @subtitle, @artist, @album, @image_url, @duration_ms, @is_live, @mbid, @isrc
WHERE NOT EXISTS (
  SELECT 1 FROM media_items WHERE id = @id
)
ON CONFLICT(id) DO UPDATE SET
  mbid = excluded.mbid,
  isrc = excluded.isrc,
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
  updated_at = CURRENT_TIMESTAMP;
    `)

      const tx = this.conn.transaction((batch: MediaItem[]) => {
        for (const item of batch) {
          stmt.run(this.toRow(item))
        }
      })

      tx(items)
    } catch (err) {
      logger.error("Error in upsert", err)
      return
    }
  }

  async remove(id: string): Promise<void> {
    this.conn.prepare(`DELETE FROM radio_items WHERE id = ?`).run(id)
  }

  async get(id: string): Promise<MediaItem | undefined> {
    const row = this.conn
      .prepare(
        `SELECT *, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
      WHERE a.id = ?`,
      )
      .get(id)
    if (!row) return undefined

    const mediaItem = this.fromRow(row)

    if (mediaItem.isrc && mediaItem.isrc != "") {
      if (!mediaItem.mbid || mediaItem.mbid == "") {
        const mbids = await musicBrainzClient.getMbidsFromIsrc(mediaItem.isrc ?? "")
        if (mbids) {
          mediaItem.mbid = mbids.join(",")
          await this.upsert([mediaItem])
        }
      }
    }

    return mediaItem
  }

  async list(): Promise<MediaItem[]> {
    const rows = this.conn
      .prepare(
        `SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
        ORDER BY a.title ASC`,
      )
      .all()
    return rows.map((r: any) => this.fromRow(r))
  }

  async listWithPaging(offset: number = 0, limit: number = 100): Promise<MediaItem[]> {
    const rows = this.conn
      .prepare(
        `SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
        ORDER BY a.title ASC
       LIMIT @limit OFFSET @offset`,
      )
      .all({ limit, offset })

    return rows.map((r: any) => this.fromRow(r))
  }

  async listByItemTypes(
    itemTypes: AudioSourceItemType | AudioSourceItemType[],
  ): Promise<MediaItem[]> {
    const types = toArray(itemTypes)
    if (types.length === 0) return []

    const placeholders = types.map(() => "?").join(", ")

    const rows = this.conn
      .prepare(
        `
      SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
      WHERE a.item_type IN (${placeholders})
      ORDER BY a.title ASC
    `,
      )
      .all(...itemTypes)

    return rows.map((r: any) => this.fromRow(r))
  }

  async listByItemTypesWithPaging(
    itemTypes: AudioSourceItemType | AudioSourceItemType[],
    offset: number = 0,
    limit: number = 100,
  ): Promise<MediaItem[]> {
    const types = toArray(itemTypes)
    if (types.length === 0) return []

    const placeholders = types.map(() => "?").join(", ")

    const rows = this.conn
      .prepare(
        `
      SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
              WHERE a.item_type IN (${placeholders})
      ORDER BY a.title ASC
      LIMIT ? OFFSET ?
    `,
      )
      .all(...itemTypes, limit, offset)

    return rows.map((r: any) => this.fromRow(r))
  }

  async findBySourceRef(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    const row = this.conn
      .prepare(
        `
        SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
        WHERE a.source = ?
          AND a.item_type = ?
          AND a.source_id = ?
          AND COALESCE(a.parent_source_id, '') = COALESCE(?, '')
      `,
      )
      .get(ref.source, ref.itemType, ref.sourceId, ref.parentSourceId ?? null)

    return row ? this.fromRow(row) : undefined
  }

  async findBySourceId(id: string): Promise<MediaItem | undefined> {
    const row = this.conn
      .prepare(
        `
        SELECT a.*, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
        WHERE source_id = ?
      `,
      )
      .get(id)

    return row ? this.fromRow(row) : undefined
  }

  async search(query: string): Promise<MediaItem[]> {
    const like = `%${query}%`
    const rows = this.conn
      .prepare(
        `
        SELECT *, CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS library
         FROM radio_items AS a
        LEFT JOIN media_items AS b ON a.id = b.id
         WHERE a.title LIKE @q
           OR a.artist LIKE @q
           OR a.album LIKE @q
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
      is_live: item.isLive ? 1 : 0,
      mbid: item.mbid ?? "",
      isrc: item.isrc ?? "",
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
      mbid: row.mbid ?? "",
      isrc: row.isrc ?? "",
      library: row.library === 1,
    }
  }
}
