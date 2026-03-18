-- migrate:up
CREATE TABLE history (
    id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    artist TEXT,
    img TEXT,
    type TEXT NOT NULL,
    uri TEXT NOT NULL,
    format TEXT,
    is_folder BOOLEAN NOT NULL,
    country TEXT,
    bitrate TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_created_at
    ON history (created_at);

-- migrate:down
DROP INDEX IF EXISTS idx_history_created_at;
DROP TABLE IF EXISTS history;
