import { db } from "@/infra/db"
import { logger } from "@/logger"
import {
  CreateSubscriptionEpisodeInput,
  SubscriptionEpisode,
  SubscriptionEpisodesStore,
} from "@/types"

export class SqliteSubscriptionEpisodesStore implements SubscriptionEpisodesStore {
  private static readonly markListenedStmt = db.prepare(`
  UPDATE subscriptionepisodes
  SET listened = 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`)

  private static readonly insertStmt = db.prepare(`
    INSERT INTO subscriptionepisodes (
      id, source, item_type, source_id, parent_source_id, source_uri,
      title, subtitle, image_url, duration_ms, listened, published_at
    ) VALUES (
      @id, @source, @item_type, @source_id, @parent_source_id, @source_uri,
      @title, @subtitle, @image_url, @duration_ms, @listened, @published_at
    )
  `)

  private static readonly updateStmt = db.prepare(`
    UPDATE subscriptionepisodes SET
      source=@source,
      item_type=@item_type,
      source_id=@source_id,
      parent_source_id=@parent_source_id,
      source_uri=@source_uri,
      title=@title,
      subtitle=@subtitle,
      image_url=@image_url,
      duration_ms=@duration_ms,
      listened=@listened,
      published_at=@published_at,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=@id
  `)

  private static readonly getStmt = db.prepare(`SELECT * FROM subscriptionepisodes WHERE id = ?`)

  private static readonly listStmt = db.prepare(
    `SELECT * FROM subscriptionepisodes ORDER BY created_at DESC`,
  )

  private static readonly deleteStmt = db.prepare(`DELETE FROM subscriptionepisodes WHERE id = ?`)

  // ---------------------------
  // Mapping helpers
  // ---------------------------

  private toRow(input: CreateSubscriptionEpisodeInput) {
    return {
      id: input.id,
      source: input.source,
      item_type: input.item_type,
      source_id: input.source_id,
      parent_source_id: input.parent_source_id ?? null,
      source_uri: input.source_uri ?? null,
      title: input.title,
      subtitle: input.subtitle ?? null,
      image_url: input.image_url ?? null,
      duration_ms: input.duration_ms ?? null,
      listened: input.listened ?? 0,
      published_at: input.published_at ?? 0,
    }
  }

  private fromRow(row: any): SubscriptionEpisode {
    return {
      id: row.id,
      source: row.source,
      item_type: row.item_type,
      source_id: row.source_id,
      parent_source_id: row.parent_source_id,
      source_uri: row.source_uri,
      title: row.title,
      subtitle: row.subtitle,
      image_url: row.image_url,
      duration_ms: row.duration_ms,
      listened: row.listened,
      created_at: row.created_at,
      updated_at: row.updated_at,
      published_at: row.published_at,
    }
  }

  // ---------------------------
  // Store methods
  // ---------------------------

  markListened(id: string): void {
    logger.info({ id }, "mark episode as listened")

    SqliteSubscriptionEpisodesStore.markListenedStmt.run(id)
  }

  create(input: CreateSubscriptionEpisodeInput): SubscriptionEpisode {
    logger.info({ input }, "create subscription episode")
    SqliteSubscriptionEpisodesStore.insertStmt.run(this.toRow(input))
    return this.get(input.id)!
  }

  update(input: CreateSubscriptionEpisodeInput): SubscriptionEpisode {
    logger.info({ input }, "update subscription episode")
    SqliteSubscriptionEpisodesStore.updateStmt.run(this.toRow(input))
    return this.get(input.id)!
  }

  get(id: string): SubscriptionEpisode | null {
    logger.debug({ id }, "get subscription episode")
    const row = SqliteSubscriptionEpisodesStore.getStmt.get(id)
    return row ? this.fromRow(row) : null
  }

  list(): SubscriptionEpisode[] {
    logger.debug("list subscription episodes")
    return SqliteSubscriptionEpisodesStore.listStmt.all().map((r: any) => this.fromRow(r))
  }

  listForSubscription(id: string): SubscriptionEpisode[] {
    logger.debug({ id }, "list episodes for subscription")
    const stmt = db.prepare(
      `SELECT * FROM subscriptionepisodes WHERE parent_source_id = ? ORDER BY published_at DESC`,
    )
    return stmt.all(id).map((r: any) => this.fromRow(r))
  }

  delete(id: string): void {
    logger.info({ id }, "delete subscription episode")
    SqliteSubscriptionEpisodesStore.deleteStmt.run(id)
  }

  deleteAllForSubscription(subscriptionId: string): void {
    logger.info({ subscriptionId }, "delete all episodes for subscription")
    db.prepare(`DELETE FROM subscriptionepisodes WHERE parent_source_id = ?`).run(subscriptionId)
  }
}
