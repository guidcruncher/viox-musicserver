import { MediaSourceRef } from "./index"

export interface MediaItem {
  id: string // internal VIOX ID (uuid or hash)
  sourceRef: MediaSourceRef

  title: string
  subtitle?: string
  artist?: string
  album?: string
  imageUrl?: string

  durationMs?: number // null for live
  isLive?: boolean // true for stations

  isrc?: string
  mbid?: string

  // Optional extended metadata
  description?: string
  releaseDate?: string
  explicit?: boolean
}
