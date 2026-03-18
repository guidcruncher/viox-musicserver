import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";

export class YouTubeMusicSourceAdapter implements AudioSourceAdapter {
  readonly id = "youtube";

  constructor(/* youtubeClient */) {}

  async search(query: string): Promise<MediaItem[]> {
    return [];
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    return null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    return null;
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    return [];
  }
}

export youTubeMusicSourceAdapter = (async ()=>  { return new YouTubeMusicSourceAdapter() })
