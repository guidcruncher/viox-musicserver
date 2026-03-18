import type {
  AudioSourceRegistry,
  LibraryStore,
  PlaylistStore,
  MediaItem,
} from "@/types";

export class LibrarySyncService {
  constructor(
    private readonly registry: AudioSourceRegistry,
    private readonly library: LibraryStore,
    private readonly playlists: PlaylistStore
  ) {}

  async syncSource(source: string): Promise<void> {
    const adapter = this.registry.getAdapter(source as any);

    // Some sources support browsing root categories
    if (adapter.browse) {
      const items = await adapter.browse({
        source: source as any,
        kind: "root",
      });

      await this.library.upsert(items);
    }
  }

  async syncAll(): Promise<void> {
    const sources = this.registry.listSources();
    for (const source of sources) {
      await this.syncSource(source);
    }
  }

  async syncPlaylist(ref: any): Promise<void> {
    const adapter = this.registry.getAdapter(ref.source);

    if (!adapter.browse) return;

    const items = await adapter.browse({
      ref,
      kind: "children",
    });

    await this.library.upsert(items);
  }
}
