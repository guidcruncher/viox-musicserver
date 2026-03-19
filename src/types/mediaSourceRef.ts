export interface MediaSourceRef {
  source: string // e.g. "spotify", "local", "podverse", "radio"
  itemType: string // e.g. "track", "album", "playlist", "episode"
  sourceId: string // the provider’s canonical ID
  parentSourceId?: string // Optional parent source id
  uri?: string // optional provider URI (spotify:track:..., file://..., etc.)
}
