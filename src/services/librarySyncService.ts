import { audioSourceRegistry } from "@/core/audioSourceRegistry"
import type { AudioSource, LibraryStore, PlaylistStore } from "@/types"

export class LibrarySyncService {
  private readonly registry = audioSourceRegistry()

  constructor(
    private readonly library: LibraryStore,
    private readonly playlists: PlaylistStore,
  ) {}

  async syncSource(source: AudioSource): Promise<void> {
    const adapter = this.registry.getAdapter(source)

    // Some sources support browsing root categories
    if (adapter.browse) {
      const items = await adapter.browse({
        source: source as any,
        kind: "root",
      })

      await this.library.upsert(items)
    }
  }

  async syncAll(): Promise<void> {
    const sources = this.registry.listSources()
    for (const source of sources) {
      await this.syncSource(source)
    }
  }

  async syncPlaylist(ref: any): Promise<void> {
    const adapter = this.registry.getAdapter(ref.source)

    if (!adapter.browse) return

    const items = await adapter.browse({
      ref,
      kind: "children",
    })

    await this.library.upsert(items)
  }
}
