import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";

export class RadioBrowserSourceAdapter implements AudioSourceAdapter {
  readonly id = "radiobrowser";

  constructor(/* radioBrowserClient */) {}

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

export radioBrowserSourceAdapter = (async ()=>  { return new RadioBrowserSourceAdapter() })
