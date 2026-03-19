import { spawn } from "node:child_process"

import type { MediaItem, PlaybackBackend } from "@/types"

export class LocalPlaybackBackend implements PlaybackBackend {
  readonly id = "local"

  private ffmpeg?: any
  private pwcat?: any
  private startedAt: number | null = null
  private pausedAt: number | null = null
  private currentItem: MediaItem | null = null

  async play(item: MediaItem, positionMs = 0): Promise<void> {
    await this.stop()

    const filePath = item.sourceRef.uri ?? item.uri
    if (!filePath) throw new Error("Local backend: no file path")

    const seekArgs = positionMs > 0 ? ["-ss", (positionMs / 1000).toString()] : []

    this.ffmpeg = spawn("ffmpeg", [
      ...seekArgs,
      "-i",
      filePath,
      "-vn",
      "-f",
      "s16le",
      "-ac",
      "2",
      "-ar",
      "48000",
      "pipe:1",
    ])

    this.pwcat = spawn("pw-cat", ["-p", "48000", "-c", "2", "-f", "S16_LE", "-"])

    this.ffmpeg.stdout.pipe(this.pwcat.stdin)

    this.startedAt = Date.now() - positionMs
    this.pausedAt = null
    this.currentItem = item
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return
    this.pausedAt = await this.getPosition()
    await this.stop()
  }

  async stop(): Promise<void> {
    if (this.ffmpeg) this.ffmpeg.kill("SIGTERM")
    if (this.pwcat) this.pwcat.kill("SIGTERM")
    this.ffmpeg = undefined
    this.pwcat = undefined
    this.startedAt = null
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentItem) return
    await this.play(this.currentItem, positionMs)
  }

  async getPosition(): Promise<number> {
    if (this.pausedAt !== null) return this.pausedAt
    if (!this.startedAt) return 0
    return Date.now() - this.startedAt
  }
}
