-- migrate:up
CREATE TABLE listens (
    id TEXT PRIMARY KEY,
    total INTEGER NOT NULL DEFAULT 1,
    total_duration INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_listened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uri TEXT,
    parent TEXT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    img TEXT,
    artist TEXT,
    type TEXT NOT NULL,
    format TEXT,
    isFolder BOOLEAN DEFAULT 0,
    country TEXT,
    bitrate TEXT,
    favourite BOOLEAN DEFAULT 0
);

-- migrate:down
DROP TABLE IF EXISTS listens;
