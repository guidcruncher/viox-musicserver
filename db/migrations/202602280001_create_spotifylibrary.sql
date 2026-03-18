-- migrate:up
CREATE TABLE spotifylibrary (
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

CREATE INDEX idx_spotifylibrary_parent ON spotifylibrary(parent);
CREATE INDEX idx_spotifylibrary_type ON spotifylibrary(type);
CREATE INDEX idx_spotifylibrary_favourite ON spotifylibrary(favourite);

-- migrate:down
DROP TABLE IF EXISTS spotifylibrary;
