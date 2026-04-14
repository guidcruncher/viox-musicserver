import { AudioSource, AudioSourceCap, BrowseOptions, MediaItem, MediaSourceRef } from "./index"

export interface AudioSourceAdapter {
  readonly id: AudioSource
  readonly caps: AudioSourceCap

  search(query: string, offset: number, limit: number): Promise<MediaItem[]>

  getById(ref: MediaSourceRef): Promise<MediaItem | undefined>

  getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined>

  browse?(options: BrowseOptions): Promise<MediaItem[]>

  getItems(ref: MediaSourceRef, offset: number, limit: number): Promise<MediaItem[] | undefined>
}
