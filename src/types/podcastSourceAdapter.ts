import { AudioSource, MediaItem, MediaItemNormalizer } from "./index"

export interface PodcastSourceAdapter {
  readonly id: AudioSource

  readonly normalizer: MediaItemNormalizer

  getPodcast(id: string): Promise<MediaItem | undefined>

  getEpisodes(id: string): Promise<MediaItem[] | undefined>
}
