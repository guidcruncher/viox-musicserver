-- migrate:up

CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  language TEXT,
  is_explicit INTEGER,
  is_public INTEGER,
  last_episode_pub_date TEXT
);

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  podcast_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  media_url TEXT NOT NULL,
  pub_date TEXT,
  listen_date TEXT,
  listened INTEGER NOT NULL,
  duration INTEGER,

  FOREIGN KEY (podcast_id) REFERENCES podcasts(id)
);

CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_pub_date ON episodes(pub_date);

-- migrate:down

DROP TABLE IF EXISTS episodes;
DROP TABLE IF EXISTS podcasts;
