-- migrate:up
CREATE TABLE musicbrainz_idmap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isrc TEXT NOT NULL,
    key TEXT NOT NULL,
    mbid TEXT NOT NULL,
    UNIQUE(isrc, key) -- This is required for the upsert to work
);

-- migrate:down
DROP TABLE IF EXISTS musicbrainz_idmap;
