export const spotifyScopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-position",
  "streaming",
  "app-remote-control",
  "playlist-read-collaborative",
].join(" ")

export const spotifyExcludeFields = [
  "available_markets",
  "external_urls",
  "external_ids",
  "href",
  "type",
  "restrictions",
  "linked_from",
  "preview_url",
]
