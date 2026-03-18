-- migrate:up
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mediaitemid TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_created_at
    ON history (created_at);

-- migrate:down
DROP INDEX IF EXISTS idx_history_created_at;
DROP TABLE IF EXISTS history;
