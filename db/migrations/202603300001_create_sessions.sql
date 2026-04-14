-- migrate:up
CREATE TABLE playback_session (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER
);

-- migrate:down
DROP TABLE IF EXISTS playback_session;
