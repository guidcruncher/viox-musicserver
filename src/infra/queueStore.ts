import { db } from "@/infra/db";
import type { QueueStore } from "@/types";

export class SqliteQueueStore implements QueueStore {
  private readonly conn = db;

  async setQueue(itemIds: string[], startIndex: number = 0): Promise<void> {
    const clearStmt = this.conn.prepare(`DELETE FROM playback_queue`);
    const insertStmt = this.conn.prepare(`
      INSERT INTO playback_queue (media_item_id, position)
      VALUES (@media_item_id, @position)
    `);
    const setMetaStmt = this.conn.prepare(`
      INSERT INTO queue_meta (id, current_index)
      VALUES (1, @current_index)
      ON CONFLICT(id) DO UPDATE SET current_index = excluded.current_index
    `);

    const tx = this.conn.transaction((ids: string[]) => {
      clearStmt.run();
      ids.forEach((id, idx) =>
        insertStmt.run({ media_item_id: id, position: idx })
      );
      setMetaStmt.run({ current_index: startIndex });
    });

    tx(itemIds);
  }

  async enqueue(itemId: string): Promise<void> {
    const maxPosRow = this.conn
      .prepare(`SELECT MAX(position) as maxPos FROM playback_queue`)
      .get();
    const nextPos = (maxPosRow?.maxPos ?? -1) + 1;

    this.conn
      .prepare(
        `INSERT INTO playback_queue (media_item_id, position)
         VALUES (?, ?)`
      )
      .run(itemId, nextPos);
  }

  async enqueueNext(itemId: string): Promise<void> {
    const meta = this.getMeta();
    const currentIndex = meta.current_index ?? 0;
    const insertPos = currentIndex + 1;

    const shiftStmt = this.conn.prepare(`
      UPDATE playback_queue
      SET position = position + 1
      WHERE position >= @pos
    `);
    const insertStmt = this.conn.prepare(`
      INSERT INTO playback_queue (media_item_id, position)
      VALUES (@media_item_id, @position)
    `);

    const tx = this.conn.transaction(() => {
      shiftStmt.run({ pos: insertPos });
      insertStmt.run({ media_item_id: itemId, position: insertPos });
    });

    tx();
  }

  async remove(itemId: string): Promise<void> {
    const row = this.conn
      .prepare(
        `SELECT position FROM playback_queue WHERE media_item_id = ? LIMIT 1`
      )
      .get(itemId);
    if (!row) return;

    const pos = row.position;

    const deleteStmt = this.conn.prepare(
      `DELETE FROM playback_queue WHERE media_item_id = ?`
    );
    const shiftStmt = this.conn.prepare(`
      UPDATE playback_queue
      SET position = position - 1
      WHERE position > @pos
    `);

    const tx = this.conn.transaction(() => {
      deleteStmt.run(itemId);
      shiftStmt.run({ pos });
    });

    tx();
  }

  async clear(): Promise<void> {
    this.conn.prepare(`DELETE FROM playback_queue`).run();
    this.conn
      .prepare(
        `INSERT INTO queue_meta (id, current_index)
         VALUES (1, 0)
         ON CONFLICT(id) DO UPDATE SET current_index = 0`
      )
      .run();
  }

  async getQueue(): Promise<string[]> {
    const rows = this.conn
      .prepare(
        `SELECT media_item_id FROM playback_queue ORDER BY position ASC`
      )
      .all();
    return rows.map((r: any) => r.media_item_id);
  }

  async getCurrent(): Promise<string | undefined> {
    const meta = this.getMeta();
    const idx = meta.current_index ?? 0;
    const row = this.conn
      .prepare(
        `SELECT media_item_id FROM playback_queue WHERE position = ? LIMIT 1`
      )
      .get(idx);
    return row?.media_item_id;
  }

  async getNext(): Promise<string | undefined> {
    const meta = this.getMeta();
    const idx = (meta.current_index ?? 0) + 1;
    const row = this.conn
      .prepare(
        `SELECT media_item_id FROM playback_queue WHERE position = ? LIMIT 1`
      )
      .get(idx);
    return row?.media_item_id;
  }

  async getPrevious(): Promise<string | undefined> {
    const meta = this.getMeta();
    const idx = (meta.current_index ?? 0) - 1;
    if (idx < 0) return undefined;
    const row = this.conn
      .prepare(
        `SELECT media_item_id FROM playback_queue WHERE position = ? LIMIT 1`
      )
      .get(idx);
    return row?.media_item_id;
  }

  async setCurrentIndex(index: number): Promise<void> {
    this.conn
      .prepare(
        `INSERT INTO queue_meta (id, current_index)
         VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET current_index = excluded.current_index`
      )
      .run(index);
  }

  private getMeta(): { current_index: number | null } {
    const row = this.conn
      .prepare(`SELECT current_index FROM queue_meta WHERE id = 1`)
      .get();
    return row ?? { current_index: null };
  }
}
