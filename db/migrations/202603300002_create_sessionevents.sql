-- migrate:up
CREATE TABLE playback_session_events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    vioxid TEXT,
    type TEXT NULL,
    created_at INTEGER NOT NULL,
    finished_at INTEGRR,
    FOREIGN KEY (session_id) REFERENCES playback_session(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_events_session ON playback_session_events(session_id);
CREATE INDEX idx_events_vioxid ON playback_session_events(vioxid);

-- migrate:down
DROP TABLE IF EXISTS playback_session_events;
