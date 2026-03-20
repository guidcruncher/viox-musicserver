// src/infra/playback/playbackController.ts
import type { MediaItem } from "@/types"
import type { PlaybackBackend } from "@/types"
import type { BackendRouter } from "@/types"

export class PlaybackController {
  private currentBackend: PlaybackBackend | null = null
  private currentItem: MediaItem | null = null

  constructor(private readonly router: BackendRouter) {}

  async play(_id: string): Promise<void> {
    // You’ll likely look up the MediaItem from the library here.
    // For now, assume router can resolve from an item you already have.
    throw new Error("PlaybackController.play(id) needs MediaItem lookup wiring")
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
