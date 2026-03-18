-- migrate:up
CREATE TABLE IF NOT EXISTS podcast_subscriptions (
  podcast_id TEXT PRIMARY KEY,
  subscribed_at TEXT NOT NULL
);

-- migrate:down
DROP TABLE IF EXISTS podcast_subscriptions;
