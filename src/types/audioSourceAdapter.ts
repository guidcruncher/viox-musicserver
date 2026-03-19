import { AudioSource, BrowseOptions, MediaItem, MediaSourceRef } from "./index"

export interface AudioSourceAdapter {
  readonly id: AudioSource

  search(query: string): Promise<MediaItem[]>

  getById(ref: MediaSourceRef): Promise<MediaItem | null>

  getPlaybackUrl(ref: MediaSourceRef): Promise<string | null>

  browse?(options: BrowseOptions): Promise<MediaItem[]>
}
