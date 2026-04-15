import { db } from "@/infra/db"
import { MediaItem, MediaSourceRef, QueueEvent } from "@/types"
import { QueueStore } from "@/types"
import { normalizeUrl } from "@/utils/normalizers"

interface QueueItemRow {
  queueId: string
  trackId: string
  position: number
  addedAt: number
  metadata?: any
}

export class SqliteQueueStore implements QueueStore {
  private readonly conn = db

  private now(): number {
    return Math.floor(Date.now() / 1000)
  }

  // --- Load full queue state ------------------------------------------------

  getQueueItems(): QueueItemRow[] {
    const rows = this.conn
      .prepare(
        `
        SELECT queue_id, track_id, position, added_at, metadata
        FROM queue_items
        ORDER BY position ASC
      `,
      )
      .all()

    return rows.map((r: any) => ({
      queueId: r.queue_id,
      trackId: r.track_id,
      position: r.position,
      addedAt: r.added_at,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    }))
  }

  getQueueContents(): MediaItem[] {
    const rows = this.conn
      .prepare(
        `
        SELECT a.position AS position, b.*, 1 AS library FROM queue_items AS a INNER JOIN media_items AS b ON a.track_id = b.id 
        UNION
        SELECT d.position AS position, c.*, 0 AS library FROM queue_items AS d INNER JOIN media_cache AS c ON d.track_id = c.id 
        UNION
        SELECT f.position AS position, e.*, 0 AS library FROM queue_items AS f INNER JOIN media_cache AS e ON f.track_id = e.id 
        ORDER BY position ASC
      `,
      )
      .all()

    return rows.map((r: any) => {
      return this.fromMediaRow(r)
    })
  }

  getQueueEvents(): QueueEvent[] {
    const rows = this.conn
      .prepare(
        `
        SELECT seq, type, payload, created_at
        FROM queue_events
        ORDER BY seq ASC
      `,
      )
      .all()

    return rows.map((r: any) => ({
      seq: r.seq,
      type: r.type,
      payload: JSON.parse(r.payload),
      createdAt: r.created_at,
    }))
  }

  // --- Mutations ------------------------------------------------------------

  insertItem(item: QueueItemRow): void {
    this.conn
      .prepare(
        `
        INSERT INTO queue_items (queue_id, track_id, position, added_at, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        item.queueId,
        item.trackId,
        item.position,
        item.addedAt,
        item.metadata ? JSON.stringify(item.metadata) : null,
        this.now(),
      )
  }

  updatePositions(items: QueueItemRow[]): void {
    const stmt = this.conn.prepare(
      `
      UPDATE queue_items
      SET position = ?
      WHERE queue_id = ?
    `,
    )

    const tx = this.conn.transaction(() => {
      items.forEach((item, index) => {
        stmt.run(index, item.queueId)
      })
    })

    tx()
  }

  removeItem(queueId: string): void {
    this.conn
      .prepare(
        `
        DELETE FROM queue_items
        WHERE queue_id = ?
      `,
      )
      .run(queueId)
  }

  clear(): void {
    this.conn.prepare(`DELETE FROM queue_items`).run()
  }

  reset(): void {
    this.conn.prepare(`DELETE FROM queue_items`).run()
    this.conn.prepare(`DELETE FROM queue_events`).run()
  }

  // --- Event log ------------------------------------------------------------

  appendEvent(seq: number, type: string, payload: any): void {
    this.conn
      .prepare(
        `
        INSERT INTO queue_events (seq, type, payload, created_at)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(seq, type, JSON.stringify(payload), this.now())
  }

  private fromMediaRow(row: any): MediaItem {
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
      imageUrl: normalizeUrl(row.image_url),
      durationMs: row.duration_ms ?? undefined,
      isLive: row.is_live === 1,
      mbid: row.mbid ?? "",
      isrc: row.isrc ?? "",
      library: row.library === 1,
    }
  }
}
