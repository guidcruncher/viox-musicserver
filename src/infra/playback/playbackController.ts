// src/infra/playback/playbackController.ts
import type { MediaItem, PlaylistStore } from "@/types"
import type { PlaybackBackend } from "@/types"
import type { BackendRouter } from "@/types"
import { LibraryStore } from "@/types"

export class PlaybackController {
  private currentBackend: PlaybackBackend | null = null
  private currentItem: MediaItem | null = null

  constructor(
    private readonly library: LibraryStore,
    private readonly playlist: PlaylistStore,
    private readonly router: BackendRouter,
  ) {}

  async play(id: string, parent?: string): Promise<void> {
    const item = await this.library.get(id)
    if (!item) {
      throw new Error(`MediaItem ${id} not found in library`)
    }
    let parentSourceUri: string | undefined = undefined
    if (parent) {
      if (parent.includes("viox:playlist")) {
        parentSourceUri = (await this.playlist.get(parent))?.sourceUri
      } else {
        parentSourceUri = (await this.library.get(parent))?.sourceRef.uri
      }
    }
    return this.playItem(item, parentSourceUri)
  }

  async playItem(item: MediaItem, parentSourceUri?: string): Promise<void> {
    const backend = this.router.resolveBackendFor(item)

    if (this.currentBackend && this.currentBackend !== backend) {
      await this.currentBackend.stop().catch(() => {})
    }

    this.currentBackend = backend
    this.currentItem = item

    await backend.play(item, parentSourceUri)
  }

  async pause(): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.pause()
  }

  async resume(): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.resume()
  }

  async stop(): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.stop()
    this.currentBackend = null
    this.currentItem = null
  }

  async seek(position: number): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.seek(position)
  }

  getCurrentItem(): MediaItem | null {
    return this.currentItem
  }
}
