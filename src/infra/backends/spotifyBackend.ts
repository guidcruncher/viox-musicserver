import type { MediaItem, PlaybackBackend } from "@/types"
import { SpotifyWebClient } from "@/infra/spotify/SpotifyWebClient"

export class SpotifyPlaybackBackend implements PlaybackBackend {
  readonly id = "spotify"

  private readonly api: SpotifyWebClient
  private currentItem: MediaItem | null = null
  private startedAt: number | null = null
  private pausedAt: number | null = null

  constructor() {
    this.api = new SpotifyWebClient()
  }

  async play(item: MediaItem, positionMs: number = 0): Promise<void> {
    this.currentItem = item

    const uri =
      item.sourceRef.uri ??
      item.sourceRef.sourceId ??
      (typeof item.id === "string" && item.id.startsWith("spotify:") ? item.id : null)

    if (!uri) {
      throw new Error("SpotifyPlaybackBackend: no Spotify URI on MediaItem")
    }

    await this.api.player.play(uri, undefined, false)

    this.startedAt = Date.now() - positionMs
    this.pausedAt = null

    if (positionMs > 0) {
      await this.api.player.seek(positionMs)
    }
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return
    await this.api.player.pause()
    this.pausedAt = await this.getPosition()
  }

  async stop(): Promise<void> {
    if (!this.currentItem) return
    await this.api.player.pause()
    this.currentItem = null
    this.startedAt = null
    this.pausedAt = null
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentItem) return
    await this.api.player.seek(positionMs)
    this.startedAt = Date.now() - positionMs
    this.pausedAt = null
  }

  async getPosition(): Promise<number> {
    if (this.pausedAt !== null) return this.pausedAt
    if (!this.startedAt) return 0
    return Date.now() - this.startedAt
  }
}
