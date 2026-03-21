// infra/backends/podverse-backend.ts
import { spawn } from "node:child_process"

import { eventBus } from "@/infra/eventbus/eventBus"
import type { MediaItem, PlaybackBackend } from "@/types"

export class PodversePlaybackBackend implements PlaybackBackend {
  readonly id = "podverse"

  private ffmpeg?: any
  private pwcat?: any
  private startedAt: number | null = null
  private pausedAt: number | null = null
  private currentItem: MediaItem | null = null

  async play(item: MediaItem, parentSourceUri?:string, positionMs = 0): Promise<void> {
    await this.stop()

    this.currentItem = item
    const url = item.sourceRef.uri
    if (!url) throw new Error("Podverse backend: no media URL")

    const seekArgs = positionMs > 0 ? ["-ss", (positionMs / 1000).toString()] : []

    this.ffmpeg = spawn("ffmpeg", [
      ...seekArgs,
      "-i",
      url,
      "-vn",
      "-f",
      "s16le",
      "-ac",
      "2",
      "-ar",
      "48000",
      "pipe:1",
    ])

    this.pwcat = spawn("pw-cat", [
      "--target",
      "streamer",
      "--playback",
      "--raw",
      "--rate",
      "48000",
      "-channels",
      "2",
      "--format",
      "s16",
      "-",
    ])

    this.ffmpeg.stdout.pipe(this.pwcat.stdin)

    this.startedAt = Date.now() - positionMs
    this.pausedAt = null
    eventBus.emit({ type: "track_start", payload: { track: item, position: positionMs } })
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return
    this.pausedAt = await this.getPosition()
    await this.stop()
    eventBus.emit({
      type: "track_pause",
      payload: { track: this.currentItem, position: this.pausedAt },
    })
  }

  async stop(): Promise<void> {
    if (this.ffmpeg) this.ffmpeg.kill("SIGTERM")
    if (this.pwcat) this.pwcat.kill("SIGTERM")
    this.ffmpeg = undefined
    this.pwcat = undefined
    this.startedAt = null
    eventBus.emit({ type: "track_stop", payload: {} })
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentItem) return
    await this.play(this.currentItem, positionMs)
    eventBus.emit({ type: "seek", payload: { track: this.currentItem, position: positionMs } })
  }

  async getPosition(): Promise<number> {
    if (this.pausedAt !== null) return this.pausedAt
    if (!this.startedAt) return 0
    return Date.now() - this.startedAt
  }

  async resume(): Promise<void> {
    if (!this.currentItem || this.pausedAt === null) return
    const position = this.pausedAt
    this.pausedAt = null
    await this.play(this.currentItem, position)
    eventBus.emit({ type: "track_start", payload: { track: this.currentItem, position: position } })
  }
}
