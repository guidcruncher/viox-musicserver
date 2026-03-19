import { getConfig } from "@/config"
import { LocalFileSystemClient } from "@/infra/local/localFileSystemClient"
import { LocalSourceAdapter } from "@/infra/sources/localAdapter"
import { PodverseSourceAdapter } from "@/infra/sources/podverseAdapter"
import { RadioBrowserSourceAdapter } from "@/infra/sources/radioBrowserAdapter"
import { SpotifySourceAdapter } from "@/infra/sources/spotifyAdapter"
import { TuneInSourceAdapter } from "@/infra/sources/tuneInAdapter"
import type {
  AudioSource,
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types"

export class AudioSourceRegistry {
  private readonly adapters = new Map<AudioSource, AudioSourceAdapter>()

  constructor(adapters: AudioSourceAdapter[]) {
    for (const adapter of adapters) {
      this.adapters.set(adapter.id, adapter)
    }
  }

  /**
   * Get adapter for a given audio source.
   * Throws if the adapter is not registered.
   */
  getAdapter(source: AudioSource): AudioSourceAdapter {
    const adapter = this.adapters.get(source)
    if (!adapter) {
      throw new Error(`No AudioSourceAdapter registered for source: ${source}`)
    }
    return adapter
  }

  /**
   * Resolves adapter from a MediaItem
   */
  getAdapterForItem(item: MediaItem): AudioSourceAdapter {
    return this.getAdapter(item.sourceRef.source)
  }

  /**
   * Resolve adapter from a MediaSourceRef.
   */
  getAdapterForRef(ref: MediaSourceRef): AudioSourceAdapter {
    return this.getAdapter(ref.source)
  }

  /**
   * Search across a specific source.
   */
  async search(source: AudioSource, query: string): Promise<MediaItem[]> {
    return this.getAdapter(source).search(query)
  }

  /**
   * Fetch metadata for a specific item.
   */
  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    return this.getAdapterForRef(ref).getById(ref)
  }

  /**
   * Get playback URL for a specific item.
   */
  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    return this.getAdapterForRef(ref).getPlaybackUrl(ref)
  }

  /**
   * Browse a source (if supported).
   */
  async browse(source: AudioSource, options: BrowseOptions): Promise<MediaItem[]> {
    const adapter = this.getAdapter(source)
    if (!adapter.browse) return []
    return adapter.browse(options)
  }

  /**
   * List all registered adapters.
   */
  listSources(): AudioSource[] {
    return [...this.adapters.keys()]
  }
}

export const audioSourceRegistry = async () => {
  const registry = new AudioSourceRegistry([
    new SpotifySourceAdapter(),
    new PodverseSourceAdapter(),
    new RadioBrowserSourceAdapter(),
    new TuneInSourceAdapter(),
    new LocalSourceAdapter(new LocalFileSystemClient(getConfig("musicFolder"))),
  ])

  return registry
}
