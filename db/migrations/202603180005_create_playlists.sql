-- migrate:up

CREATE TABLE playlists (
    id TEXT PRIMARY KEY,                -- internal VIOX playlist ID (uuid)
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    source TEXT DEFAULT 'local',        -- 'local' or 'spotify' (for imported playlists)
    source_id TEXT,                     -- spotify playlist ID if applicable
    source_uri TEXT,                    -- spotify:playlist:xxx
    total_items INTEGER DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down

DROP TABLE IF EXISTS playlists;
