import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";

export class PodverseSourceAdapter implements AudioSourceAdapter {
  readonly id = "podverse";

  constructor(/* podverseClient */) {}

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

export podverseAdapter = (async ()=>  { return new PodverseAdapter() })
