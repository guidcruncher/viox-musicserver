-- migrate:up
CREATE TABLE library (
    id TEXT NOT NULL,
    parent TEXT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    img TEXT,
    artist TEXT,
    type TEXT NOT NULL,
    uri TEXT PRIMARY KEY,
    format TEXT,
    isFolder BOOLEAN DEFAULT 0,
    country TEXT,
    bitrate TEXT,
    favourite BOOLEAN DEFAULT 0
);

CREATE INDEX idx_library_parent ON library(parent);
CREATE INDEX idx_library_type ON library(type);
CREATE INDEX idx_library_favourite ON library(favourite);

-- migrate:down
DROP TABLE IF EXISTS library;
