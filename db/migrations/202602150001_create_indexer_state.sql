-- migrate:up
CREATE TABLE IF NOT EXISTS indexer_state (
  podcast_id TEXT PRIMARY KEY,
  last_indexed_episode_date TEXT NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS indexer_state;
