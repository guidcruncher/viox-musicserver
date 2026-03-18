import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";
import { TuneInNormalizer } from "@/core/normalizers/tuneinNormalizer";

export class TuneInSourceAdapter implements AudioSourceAdapter {
  readonly id = "tunein";
  private readonly normalize = new TuneInNormalizer();

  constructor(private readonly client: any /* TuneIn API client */) {}

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.client.search(query);
    return raw.Items.map((i: any) => this.normalize.normalize(i));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const raw = await this.client.getItem(ref.sourceId);
    return raw ? this.normalize.normalize(raw) : null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    const raw = await this.client.getItem(ref.sourceId);
    return raw?.Url ?? raw?.StreamUrl ?? null;
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    // TODO: implement TuneIn category browsing
    return [];
  }
}
