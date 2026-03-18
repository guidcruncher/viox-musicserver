import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";
import { RadioBrowserNormalizer } from "@/core/normalizers/radiobrowserNormalizer";

export class RadioBrowserSourceAdapter implements AudioSourceAdapter {
  readonly id = "radiobrowser";
  private readonly normalize = new RadioBrowserNormalizer();

  constructor(private readonly client: any /* RadioBrowser API client */) {}

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.client.searchStations({ name: query });
    return raw.map((s: any) => this.normalize.normalize(s));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const raw = await this.client.getStationByUUID(ref.sourceId);
    return raw ? this.normalize.normalize(raw) : null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    const raw = await this.client.getStationByUUID(ref.sourceId);
    return raw?.url_resolved ?? raw?.url ?? null;
  }

  async browse(): Promise<MediaItem[]> {
    return []; // RadioBrowser has no hierarchical browsing
  }
}
