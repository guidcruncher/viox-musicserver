-- migrate:up

CREATE TABLE queue_items (
  queue_id     TEXT PRIMARY KEY,
  track_id     TEXT NOT NULL,
  position     INTEGER NOT NULL,
  added_at     INTEGER NOT NULL,
  metadata     TEXT,
  created_at   INTEGER NOT NULL
);

CREATE UNIQUE INDEX idx_queue_items_position ON queue_items(position);

CREATE TABLE queue_events (
  seq          INTEGER PRIMARY KEY,
  type         TEXT NOT NULL,
  payload      TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);

-- migrate:down

DROP TABLE IF EXISTS queue_events;
DROP TABLE IF EXISTS queue_items;
/