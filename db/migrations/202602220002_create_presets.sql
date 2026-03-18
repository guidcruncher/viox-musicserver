-- migrate:up
CREATE TABLE presets (
    id TEXT PRIMARY KEY,
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

CREATE INDEX idx_presets_title
    ON presets (title);

-- migrate:down
DROP INDEX IF EXISTS idx_presets_title;
DROP TABLE IF EXISTS presets;
