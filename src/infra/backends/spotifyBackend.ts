import { eventBus } from "@/infra/eventbus/eventBus"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import type { MediaItem, PlaybackBackend } from "@/types"

export class SpotifyPlaybackBackend implements PlaybackBackend {
  readonly id = "spotify"

  private readonly api: SpotifyWebClient
  private currentItem: MediaItem | null = null
  private startedAt: number | null = null
  private pausedAt: number | null = null

  constructor() {
    this.api = new SpotifyWebClient()
  }

  async resume(): Promise<void> {
    if (!this.api.player) return
    await this.api.player.resume()
    eventBus.emit({
      type: "track_start",
      payload: { track: this.currentItem, position: this.pausedAt },
    })
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
    eventBus.emit({
      type: "track_start",
      payload: { track: this.currentItem, position: positionMs },
    })
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return
    await this.api.player.pause()
    this.pausedAt = await this.getPosition()
    eventBus.emit({ type: "track_pause", payload: { track: item, position: this.pausedAt } })
  }

  async stop(): Promise<void> {
    if (!this.currentItem) return
    await this.api.player.pause()
    this.currentItem = null
    this.startedAt = null
    this.pausedAt = null
    eventBus.emit({ type: "track_stop", payload: {} })
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentItem) return
    await this.api.player.seek(positionMs)
    this.startedAt = Date.now() - positionMs
    this.pausedAt = null
    eventBus.emit({ type: "seek", payload: { track: this.currentItem, position: positionMs } })
  }

  async getPosition(): Promise<number> {
    if (this.pausedAt !== null) return this.pausedAt
    if (!this.startedAt) return 0
    return Date.now() - this.startedAt
  }
}
