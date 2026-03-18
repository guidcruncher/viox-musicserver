// listen-events.repository.ts
import { db } from "./db"

class ListenEventsRepository {
  startSession(listenId: string): number {
    const result = db
      .prepare(
        `
      INSERT INTO listen_events (id)
      VALUES (?)
    `,
      )
      .run(listenId)

    return result.lastInsertRowid as number
  }

  endSession(eventId: number): string | undefined {
    db.prepare(
      `
      UPDATE listen_events
      SET ended_at = CURRENT_TIMESTAMP
      WHERE event_id = ?
    `,
    ).run(eventId)

    // Return the associated listen_id
    const row = db
      .prepare(
        `
      SELECT id
      FROM listen_events
      WHERE event_id = ?
    `,
      )
      .get(eventId)

    if (!row) return undefined
    return (row as any).id
  }

  getDuration(eventId: number): number | null {
    const row = db
      .prepare(
        `
      SELECT 
        strftime('%s', ended_at) - strftime('%s', started_at) AS duration_seconds
      FROM listen_events
      WHERE event_id = ?
    `,
      )
      .get(eventId)

    if (!row) return 0
    return (row as any).duration_seconds ?? null
  }

  getTotalDurationForListen(listenId: string): number {
    const row = db
      .prepare(
        `
      SELECT 
        SUM(strftime('%s', ended_at) - strftime('%s', started_at)) AS total_seconds
      FROM listen_events
      WHERE id = ? AND ended_at IS NOT NULL
    `,
      )
      .get(listenId)

    if (!row) return 0
    return (row as any).total_seconds ?? 0
  }
}

export const listenEventsRepository = new ListenEventsRepository()
