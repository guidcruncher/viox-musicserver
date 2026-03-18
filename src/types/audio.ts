import { MediaItem } from "./media-types"

export type AudioBackend = "spotify" | "mpd"

export interface AudioStatus {
  active: AudioBackend | undefined
  playing: boolean
  currentTrack: MediaItem | undefined
}
