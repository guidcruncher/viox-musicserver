// src/infra/playback/playbackController.ts
import type { MediaItem } from "@/types"
import type { PlaybackBackend } from "@/types"
import type { BackendRouter } from "@/types"
import { LibraryStore } from "@/types"

export class PlaybackController {
  private currentBackend: PlaybackBackend | null = null
  private currentItem: MediaItem | null = null

  constructor(
    private readonly library: LibraryStore,
    private readonly router: BackendRouter,
  ) {}

  async play(id: string): Promise<void> {
    const item = await this.library.get(id)
    if (!item) {
      throw new Error(`MediaItem ${id} not found in library`)
    }
    return this.playItem(item)
  }

  async playItem(item: MediaItem): Promise<void> {
    const backend = this.router.resolveBackendFor(item)

    if (this.currentBackend && this.currentBackend !== backend) {
      await this.currentBackend.stop().catch(() => {})
    }

    this.currentBackend = backend
    this.currentItem = item

    await backend.play(item)
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
