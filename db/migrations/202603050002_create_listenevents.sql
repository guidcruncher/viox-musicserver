-- migrate:up
CREATE TABLE listen_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME
);

-- migrate:down
DROP TABLE IF EXISTS listen_events;
