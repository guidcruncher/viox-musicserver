-- migrate:up

PRAGMA foreign_keys = ON;

CREATE TABLE eq_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    gain REAL NOT NULL
);

CREATE TABLE eq_preset_bands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preset_id INTEGER NOT NULL REFERENCES eq_presets(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL,
    gain_db REAL NOT NULL
);

-- Insert presets
INSERT INTO eq_presets (name, gain) VALUES ('flat', 1.0);
INSERT INTO eq_presets (name, gain) VALUES ('bass_boost', 0.5);
INSERT INTO eq_presets (name, gain) VALUES ('loudness', 0.56);
INSERT INTO eq_presets (name, gain) VALUES ('electronic', 0.5);
INSERT INTO eq_presets (name, gain) VALUES ('warm_vintage', 0.52);
INSERT INTO eq_presets (name, gain) VALUES ('vocal_clarity', 0.58);
INSERT INTO eq_presets (name, gain) VALUES ('cinematic', 0.60);
INSERT INTO eq_presets (name, gain) VALUES ('bright_crisp', 0.54);

-- FLAT
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 0.0 FROM eq_presets WHERE name='flat';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 0.0 FROM eq_presets WHERE name='flat';

-- BASS BOOST
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 5.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 3.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', 1.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', 0.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', 0.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 0.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 0.0 FROM eq_presets WHERE name='bass_boost';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 0.0 FROM eq_presets WHERE name='bass_boost';

-- LOUDNESS
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 4.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 0.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', -2.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', -2.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', -2.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 0.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 1.0 FROM eq_presets WHERE name='loudness';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 4.0 FROM eq_presets WHERE name='loudness';

-- ELECTRONIC
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 5.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 1.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', -2.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', -3.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', -1.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 2.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 4.0 FROM eq_presets WHERE name='electronic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 5.0 FROM eq_presets WHERE name='electronic';

-- WARM VINTAGE
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 2.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 1.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', -1.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', -2.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', -1.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 1.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 2.0 FROM eq_presets WHERE name='warm_vintage';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 3.0 FROM eq_presets WHERE name='warm_vintage';

-- VOCAL CLARITY
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', -1.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 0.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', 1.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', 2.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', 4.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 5.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 3.0 FROM eq_presets WHERE name='vocal_clarity';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 1.0 FROM eq_presets WHERE name='vocal_clarity';

-- CINEMATIC
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', 4.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 2.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', 0.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', -1.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', 1.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 3.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 4.0 FROM eq_presets WHERE name='cinematic';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 5.0 FROM eq_presets WHERE name='cinematic';

-- BRIGHT CRISP
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '63 Hz', -1.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '125 Hz', 0.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '250 Hz', 1.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '500 Hz', 2.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '1 kHz', 3.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '2 kHz', 4.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '4 kHz', 5.0 FROM eq_presets WHERE name='bright_crisp';
INSERT INTO eq_preset_bands (preset_id, frequency, gain_db) SELECT id, '8 kHz', 6.0 FROM eq_presets WHERE name='bright_crisp';

-- migrate:down

DROP TABLE IF EXISTS eq_preset_bands;
DROP TABLE IF EXISTS eq_presets;
