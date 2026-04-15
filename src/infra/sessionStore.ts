import crypto from "crypto"

import { db } from "@/infra/db"
import { PlaybackEvent, PlaybackSession, PlaybackSessionStore } from "@/types"

export class SqlitePlaybackSessionStore implements PlaybackSessionStore {
  private readonly conn = db

  private now(): number {
    return Math.floor(Date.now() / 1000)
  }

  startSession(): PlaybackSession {
    const id = crypto.randomUUID()
    const startedAt = this.now()

    const result = this.conn
      .prepare(
        `
      INSERT INTO playback_session (id, started_at)
      VALUES (?, ?)
    `,
      )
      .run(id, startedAt)

    return {
      sessionId: result.lastInsertRowid as number,
      id,
      startedAt,
    }
  }

  endSession(id: string): void {
    this.conn
      .prepare(
        `
      UPDATE playback_session
      SET ended_at = ?
      WHERE id = ?
    `,
      )
      .run(this.now(), id)
  }

  getSession(id: string): PlaybackSession | undefined {
    const row = this.conn
      .prepare(
        `
      SELECT * FROM playback_session WHERE id = ?
    `,
      )
      .get(id)

    return row ? this.fromSessionRow(row) : undefined
  }

  addEvent(sessionUuid: string, vioxid: string, type?: string, finishedAt?: number): number {
    const session = this.getSession(sessionUuid)
    if (!session) throw new Error("Session not found")

    const result = this.conn
      .prepare(
        `
      INSERT INTO playback_session_events (session_id, vioxid, type, created_at, finished_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(session.sessionId, vioxid, type ?? null, this.now(), finishedAt ?? null)

    return result.lastInsertRowid as number
  }

  getEvents(sessionUuid: string): PlaybackEvent[] {
    const session = this.getSession(sessionUuid)
    if (!session) return []

    const rows = this.conn
      .prepare(
        `
      SELECT *
      FROM playback_session_events
      WHERE session_id = ?
      ORDER BY created_at ASC
    `,
      )
      .all(session.sessionId)

    return rows.map((r) => this.fromEventRow(r))
  }

  deleteSession(id: string): void {
    this.conn
      .prepare(
        `
      DELETE FROM playback_session WHERE id = ?
    `,
      )
      .run(id)
  }

  private fromSessionRow(row: any): PlaybackSession {
    return {
      sessionId: row.session_id,
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at ?? undefined,
    }
  }

  private fromEventRow(row: any): PlaybackEvent {
    return {
      eventId: row.event_id,
      sessionId: row.session_id,
      vioxid: row.vioxid,
      type: row.type ?? undefined,
      createdAt: row.created_at,
      finishedAt: row.finished_at ?? undefined,
    }
  }
}
