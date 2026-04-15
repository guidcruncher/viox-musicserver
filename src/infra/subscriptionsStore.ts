import { db } from "@/infra/db"
import { logger } from "@/logger"
import { CreateSubscriptionInput, Subscription, SubscriptionsStore } from "@/types"

export class SqliteSubscriptionsStore implements SubscriptionsStore {
  // Prepared statements (static, created once)
  private static readonly insertStmt = db.prepare(`
    INSERT INTO subscriptions (
      id, source, item_type, source_id, parent_source_id, source_uri,
      title, subtitle, image_url, last_published_at, last_listened_at
    ) VALUES (
      @id, @source, @item_type, @source_id, @parent_source_id, @source_uri,
      @title, @subtitle, @image_url, @last_published_at, @last_listened_at
    )
  `)

  private static readonly lastUpdateStmt = db.prepare(`
    UPDATE subscriptions SET
      updated_at=CURRENT_TIMESTAMP
    WHERE id=@id
  `)

  private static readonly lastListenedStmt = db.prepare(`
    UPDATE subscriptions SET
      last_listened_at = @last_listened_at
    WHERE id=@id
  `)

  private static readonly lastPublishedStmt = db.prepare(`
    UPDATE subscriptions SET
      last_published_at = @last_published_at
    WHERE id=@id
  `)

  private static readonly updateStmt = db.prepare(`
    UPDATE subscriptions SET
      source=@source,
      item_type=@item_type,
      source_id=@source_id,
      parent_source_id=@parent_source_id,
      source_uri=@source_uri,
      title=@title,
      subtitle=@subtitle,
      image_url=@image_url,
      last_published_at = @last_published_at,
      last_listened_at = @last_listened_at, 
      updated_at=CURRENT_TIMESTAMP
    WHERE id=@id
  `)

  private static readonly getStmt = db.prepare(`SELECT * FROM subscriptions WHERE id = ?`)

  private static readonly listStmt = db.prepare(
    `SELECT * FROM subscriptions ORDER BY created_at DESC`,
  )

  private static readonly deleteStmt = db.prepare(`DELETE FROM subscriptions WHERE id = ?`)

  // ---------------------------
  // Mapping helpers
  // ---------------------------

  private toRow(input: CreateSubscriptionInput) {
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
      last_published_at: input.lastpublished_at,
      last_listened_at: input.lastlistened_at,
    }
  }

  private fromRow(row: any): Subscription {
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
      created_at: row.created_at,
      updated_at: row.updated_at,
      lastlistened_at: row.last_listened_at,
      lastpublished_at: row.last_published_at,
    }
  }

  // ---------------------------
  // Store methods
  // ---------------------------
  updateLastUpdate(id: string) {
    SqliteSubscriptionsStore.lastUpdateStmt.run({ id })
  }

  updateLastListened(id: string) {
    SqliteSubscriptionsStore.lastListenedStmt.run({ id, last_listened_at: new Date().getTime() })
  }

  updateLastPublished(id: string, date: number) {
    SqliteSubscriptionsStore.lastPublishedStmt.run({ id, last_published_at: date })
  }

  create(input: CreateSubscriptionInput): Subscription {
    logger.info({ input }, "create subscription")
    SqliteSubscriptionsStore.insertStmt.run(this.toRow(input))
    return this.get(input.id)!
  }

  update(input: CreateSubscriptionInput): Subscription {
    logger.info({ input }, "update subscription")
    SqliteSubscriptionsStore.updateStmt.run(this.toRow(input))
    return this.get(input.id)!
  }

  get(id: string): Subscription | null {
    logger.debug({ id }, "get subscription")
    const row = SqliteSubscriptionsStore.getStmt.get(id)
    return row ? this.fromRow(row) : null
  }

  list(): Subscription[] {
    logger.debug("list subscriptions")
    return SqliteSubscriptionsStore.listStmt.all().map((r: any) => this.fromRow(r))
  }

  delete(id: string): void {
    logger.info({ id }, "delete subscription")
    SqliteSubscriptionsStore.deleteStmt.run(id)
  }
}
