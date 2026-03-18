-- migrate:up
CREATE TABLE presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mediaitemid TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down
DROP TABLE IF EXISTS presets;
