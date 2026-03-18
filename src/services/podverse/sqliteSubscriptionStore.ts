import { db } from "../../repositories/db"
import { presetRepository } from "../../repositories/presetRepository"
import { MediaItem } from "../../types/media-types"

export class SqliteSubscriptionStore {
  subscribe(podcastId: string): void {
    db.prepare(
      `INSERT INTO podcast_subscriptions (podcast_id, subscribed_at)
       VALUES (?, ?)
       ON CONFLICT(podcast_id)
       DO UPDATE SET subscribed_at = excluded.subscribed_at`,
    ).run(podcastId, new Date().toISOString())
  }

  unsubscribe(podcastId: string): void {
    db.prepare(`DELETE FROM podcast_subscriptions WHERE podcast_id = ?`).run(podcastId)
  }

  isSubscribed(podcastId: string): boolean {
    const row = db
      .prepare(`SELECT podcast_id FROM podcast_subscriptions WHERE podcast_id = ?`)
      .get(podcastId) as { podcast_id: string } | undefined

    return !!row
  }

  getSubscriptions(): string[] {
    const rows = db
      .prepare(`SELECT podcast_id FROM podcast_subscriptions ORDER BY subscribed_at DESC`)
      .all() as { podcast_id: string }[]

    return rows.map((r) => r.podcast_id)
  }

  getSubscriptionDetails(): MediaItem[] {
    const presets = presetRepository.findAll()
    const rows = db
      .prepare(
        `SELECT a.* FROM podcasts AS a INNER JOIN podcast_subscriptions b ON a.id = b.podcast_id ORDER BY a.title ASC`,
      )
      .all() as { podcast_id: string }[] as any

    return rows.map((r: any) => {
      return {
        id: r.id,
        title: r.title,
        subtitle: r.description,
        img: r.image_url,
        artist: "",
        type: "podcast",
        uri: r.link_url,
        format: "mpeg",
        isFolder: false,
        favourite: presets.findIndex((p: any) => p.type === "podcast" && p.id === r.id) !== -1,
      }
    })
  }
}
