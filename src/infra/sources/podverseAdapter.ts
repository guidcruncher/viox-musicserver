import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";
import { PodverseNormalizer } from "@/core/normalizers/podverseNormalizer";

export class PodverseSourceAdapter implements AudioSourceAdapter {
  readonly id = "podverse";
  private readonly normalize = new PodverseNormalizer();

  constructor(private readonly client: any /* Podverse API client */) {}

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.client.search(query);
    return raw.results.map((r: any) => this.normalize.normalize(r));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    let raw: any;

    if (ref.itemType === "podcast") {
      raw = await this.client.getPodcast(ref.sourceId);
    } else if (ref.itemType === "episode") {
      raw = await this.client.getEpisode(ref.sourceId);
    } else {
      return null;
    }

    return this.normalize.normalize(raw);
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    const raw = await this.client.getEpisode(ref.sourceId);
    return raw.mediaUrl ?? null;
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    if (!options.ref || options.ref.itemType !== "podcast") return [];

    const raw = await this.client.getPodcastEpisodes(options.ref.sourceId);
    return raw.items.map((e: any) => this.normalize.normalize(e));
  }
}
