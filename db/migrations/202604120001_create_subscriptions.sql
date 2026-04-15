-- migrate:up

CREATE TABLE subscriptions (
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
    image_url TEXT,
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_published_at INTEGER NOT NULL DEFAULT 0,
    last_listened_at INTEGER NOT NULL DEFAULT 0
);

-- migrate:down

DROP TABLE IF EXISTS subscriptionepisodes;
