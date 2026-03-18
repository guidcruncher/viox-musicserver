-- migrate:up
INSERT INTO presets (
    id,
    title,
    subtitle,
    artist,
    img,
    type,
    uri,
    format,
    is_folder,
    country,
    bitrate
) VALUES
    (
        '9614bbb6-0601-11e8-ae97-52543be04c81',
        'LBC UK',
        'Leading Britain''s Conversation',
        NULL,
        'https://www.globalplayer.com/assets/track-placeholders/lbc.png',
        'radio',
        'http://media-sov.musicradio.com/LBC973MP3Low',
        NULL,
        0,
        NULL,
        NULL
    ),
    (
        '9617bbd8-0601-11e8-ae97-52543be04c81',
        'Radio X',
        'Get Into The Music',
        NULL,
        'https://herald.musicradio.com/media/2e05011a-7517-435e-bac7-0f1cc979ee99.png',
        'radio',
        'https://media-the.musicradio.com/RadioXUK',
        NULL,
        0,
        NULL,
        NULL
    ),
    (
        'spotify:playlist:34Sz3uEHRsRF44lb8WdQoW',
        'John''s Playlist',
        'Spotify Playlist',
        NULL,
        '/img/playlist2.avif',
        'spotify',
        'spotify:playlist:34Sz3uEHRsRF44lb8WdQoW',
        NULL,
        0,
        NULL,
        NULL
    );

-- migrate:down
DELETE FROM presets
WHERE id IN ('9614bbb6-0601-11e8-ae97-52543be04c81','9617bbd8-0601-11e8-ae97-52543be04c81', 'spotify:playlist:34Sz3uEHRsRF44lb8WdQoW');
