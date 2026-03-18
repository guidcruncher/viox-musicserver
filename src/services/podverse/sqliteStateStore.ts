import { db } from "../../repositories/db"

export class SqliteStateStore {
  getLastIndexedDate(podcastId: string): string | undefined {
    const row = db
      .prepare(
        `SELECT last_indexed_episode_date AS lastIndexedEpisodeDate
         FROM indexer_state
         WHERE podcast_id = ?`,
      )
      .get(podcastId) as { lastIndexedEpisodeDate: string } | undefined

    return row?.lastIndexedEpisodeDate
  }

  setLastIndexedDate(podcastId: string, isoDate: string): void {
    db.prepare(
      `INSERT INTO indexer_state (podcast_id, last_indexed_episode_date)
         VALUES (?, ?)
         ON CONFLICT(podcast_id)
         DO UPDATE SET last_indexed_episode_date = excluded.last_indexed_episode_date`,
    ).run(podcastId, isoDate)
  }
}
