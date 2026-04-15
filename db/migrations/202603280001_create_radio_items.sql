-- migrate:up

CREATE TABLE radio_items (
    id TEXT PRIMARY KEY,                 -- internal VIOX ID (uuid or hash)
    
    -- Source reference
    source TEXT NOT NULL,                -- spotify | podverse | radiobrowser | tunein | youtube | local
    item_type TEXT NOT NULL,             -- track | album | episode | show | podcast | station
    source_id TEXT NOT NULL,             -- ID from the source (e.g. Spotify track ID)
    parent_source_id TEXT,               -- optional parent (album, show, podcast)
    source_uri TEXT,                     -- optional (e.g. spotify:track:xxx)

    -- Normalized metadata
    title TEXT NOT NULL,
    subtitle TEXT,
    artist TEXT,
    mbid TEXT,
    isrc TEXT,
    album TEXT,
    image_url TEXT,
    duration_ms INTEGER,                 -- null for live stations
    is_live BOOLEAN DEFAULT FALSE,       -- true for stations

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint for deterministic identity
CREATE UNIQUE INDEX radio_items_source_identity_idx
ON radio_items (source, item_type, source_id, COALESCE(parent_source_id, ''));

-- migrate:down

DROP TABLE IF EXISTS radio_items;
