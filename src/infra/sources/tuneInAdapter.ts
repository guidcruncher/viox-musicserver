import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";

export class TuneInSourceAdapter implements AudioSourceAdapter {
  readonly id = "tunein";

  constructor(/* tuneInClient */) {}

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

export tuneInSourceAdapter = (async ()=>  { return new TuneInSourceAdapter() })
