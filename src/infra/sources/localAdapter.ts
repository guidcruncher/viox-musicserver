import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";
import { LocalFileNormalizer } from "@/core/normalizers/localFileNormalizer";

export class LocalSourceAdapter implements AudioSourceAdapter {
  readonly id = "local";
  private readonly normalize = new LocalFileNormalizer();

  constructor(private readonly fileService: any /* local file scanner */) {}

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.fileService.search(query);
    return raw.map((f: any) => this.normalize.normalize(f));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const raw = await this.fileService.getFile(ref.sourceId);
    return raw ? this.normalize.normalize(raw) : null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    return ref.sourceId; // local file path
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    if (!options.ref) return [];

    const raw = await this.fileService.listFolder(options.ref.sourceId);
    return raw.map((f: any) => this.normalize.normalize(f));
  }
}
