import { AudioSource, AudioSourceItemType } from "./index"

export interface MediaSourceRef {
  source: AudioSource // e.g. "spotify", "local", "podverse", "radio"
  itemType: AudioSourceItemType // e.g. "track", "album", "playlist", "episode"
  sourceId: string // the provider’s canonical ID
  parentSourceId?: string // Optional parent source id
  uri?: string // optional provider URI (spotify:track:..., file://..., etc.)
}