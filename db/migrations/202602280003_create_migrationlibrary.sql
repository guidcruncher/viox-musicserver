-- migrate:up
CREATE TABLE migrationlibrary (
    id TEXT,
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

CREATE INDEX idx_migrationlibrary_parent ON migrationlibrary(parent);
CREATE INDEX idx_migrationlibrary_type ON migrationlibrary(type);
CREATE INDEX idx_migrationlibrary_favourite ON migrationlibrary(favourite);

-- migrate:down
DROP TABLE IF EXISTS migrationlibrary;
