-- migrate:up

CREATE TABLE playback_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,           -- ordering in queue

    inserted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure no duplicate entries at the same position
CREATE UNIQUE INDEX playback_queue_position_idx
ON playback_queue (position);

-- Optional: fast lookup by item
CREATE INDEX playback_queue_item_idx
ON playback_queue (media_item_id);

-- migrate:down

DROP TABLE IF EXISTS playback_queue;
