-- migrate:up
CREATE TABLE listen_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mediaitemid TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME
);

-- migrate:down
DROP TABLE IF EXISTS listen_events;
