-- migrate:up

CREATE TABLE playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,          -- ordering within playlist

    inserted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure deterministic ordering
CREATE UNIQUE INDEX playlist_items_position_idx
ON playlist_items (playlist_id, position);

-- Prevent duplicate entries of the same item in the same playlist
CREATE UNIQUE INDEX playlist_items_unique_idx
ON playlist_items (playlist_id, media_item_id);

-- migrate:down

DROP TABLE IF EXISTS playlist_items;
