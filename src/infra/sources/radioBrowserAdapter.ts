import type {
  AudioSourceAdapter,
  MediaItem,
  MediaSourceRef,
  BrowseOptions,
} from "@/types";

import { RadioBrowserWebClient } from "@/infra/radiobrowser/RadioBrowserWebClient";
import { RadioBrowserNormalizer } from "@/core/normalizers/radiobrowser-normalizer";

export class RadioBrowserSourceAdapter implements AudioSourceAdapter {
  readonly id = "radiobrowser";

  private readonly api = new RadioBrowserWebClient();
  private readonly normalize = new RadioBrowserNormalizer();

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.api.search({ name: query, hidebroken: true });
    return raw.map((s) => this.normalize.normalize(s));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const station = await this.api.getStation(ref.sourceId);
    return station ? this.normalize.normalize(station) : null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    const station = await this.api.getStation(ref.sourceId);
    return station?.url_resolved ?? station?.url ?? null;
  }

  async browse(): Promise<MediaItem[]> {
    return [];
  }
}
