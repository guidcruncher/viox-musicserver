import type {
  BackendRouter,
  LibraryStore,
  MediaItem,
  PlaybackEngine,
  PlaybackOrchestrator,
  PlaybackState,
  PlaylistStore,
  QueueStore,
} from "@/types"

import { audioSourceRegistry } from "./audioSourceRegistry"

export class DefaultPlaybackEngine implements PlaybackEngine {
  private readonly sources = audioSourceRegistry()

  constructor(
    private readonly library: LibraryStore,
    private readonly queue: QueueStore,
    private readonly playlists: PlaylistStore,
    private readonly router: BackendRouter,
    private readonly orchestrator: PlaybackOrchestrator,
  ) {}

  //
  // ────────────────────────────────────────────────
  //   Playback Controls
  // ────────────────────────────────────────────────
  //

  getState(): PlaybackState {
    return this.orchestrator.getState()
  }

  async play(): Promise<void> {
    await this.orchestrator.play()
  }

  async pause(): Promise<void> {
    await this.orchestrator.pause()
  }

  async stop(): Promise<void> {
    await this.orchestrator.stop()
  }

  async seek(positionMs: number): Promise<void> {
    await this.orchestrator.seek(positionMs)
  }

  async next(): Promise<void> {
    await this.orchestrator.next()
  }

  async previous(): Promise<void> {
    await this.orchestrator.previous()
  }

  //
  // ────────────────────────────────────────────────
  //   Queue Management
  // ────────────────────────────────────────────────
  //

  async setQueue(items: MediaItem[], startIndex = 0): Promise<void> {
    await this.library.upsert(items)
    await this.queue.setQueue(
      items.map((i) => i.id),
      startIndex,
    )
  }

  async enqueue(item: MediaItem): Promise<void> {
    await this.library.upsert([item])
    await this.queue.enqueue(item.id)
  }

  async enqueueNext(item: MediaItem): Promise<void> {
    await this.library.upsert([item])
    await this.queue.enqueueNext(item.id)
  }

  async clearQueue(): Promise<void> {
    await this.queue.clear()
  }

  async getQueue(): Promise<MediaItem[]> {
    const ids = await this.queue.getQueue()
    const items = await Promise.all(ids.map((id) => this.library.get(id)))
    return items.filter(Boolean) as MediaItem[]
  }

  //
  // ────────────────────────────────────────────────
  //   Library Management
  // ────────────────────────────────────────────────
  //

  async addToLibrary(item: MediaItem): Promise<void> {
    await this.library.upsert([item])
  }

  async removeFromLibrary(id: string): Promise<void> {
    await this.library.remove(id)
  }

  async searchLibrary(query: string): Promise<MediaItem[]> {
    return this.library.search(query)
  }

  //
  // ────────────────────────────────────────────────
  //   Playlist Management
  // ────────────────────────────────────────────────
  //

  async createPlaylist(name: string, description?: string): Promise<string> {
    return this.playlists.create(name, description)
  }

  async addToPlaylist(playlistId: string, item: MediaItem): Promise<void> {
    if (item.sourceRef.itemType === "station") {
      throw new Error("Live stations cannot be added to playlists")
    }
    await this.library.upsert([item])
    await this.playlists.addItem(playlistId, item.id)
  }

  async removeFromPlaylist(playlistId: string, itemId: string): Promise<void> {
    await this.playlists.removeItem(playlistId, itemId)
  }

  async getPlaylistItems(playlistId: string): Promise<MediaItem[]> {
    return this.playlists.getItems(playlistId)
  }

  //
  // ────────────────────────────────────────────────
  //   Source Operations (Search, Browse, Resolve)
  // ────────────────────────────────────────────────
  //

  async searchSource(source: string, query: string): Promise<MediaItem[]> {
    return this.sources.search(source as any, query)
  }

  async browseSource(source: string, options: any): Promise<MediaItem[]> {
    return this.sources.browse(source as any, options)
  }

  async resolveItem(ref: any): Promise<MediaItem | undefined> {
    return this.sources.getById(ref)
  }

  async resolvePlaybackUrl(ref: any): Promise<string | undefined> {
    return this.sources.getPlaybackUrl(ref)
  }
}

export const defaultPlaybackEngine = () => {}
