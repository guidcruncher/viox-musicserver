import { ChildProcess, spawn } from "child_process"

import { eventBus } from "@/infra/eventbus/eventBus"
import type { MediaItem, PlaybackBackend } from "@/types"

interface PipewireBackendOptions {
  ffmpegPath?: string
  pwCatPath?: string
}

export class PipewireFfmpegBackend implements PlaybackBackend {
  readonly id = "pipewire-ffmpeg"

  private ffmpeg?: ChildProcess
  private pwcat?: ChildProcess
  private startedAt: number | null = null
  private pausedAt: number | null = null
  private currentItem: MediaItem | null = null
  private currentParentSourceUri: string | undefined = undefined

  constructor(private readonly opts: PipewireBackendOptions = {}) {}

  async play(item: MediaItem, parentSourceUri?: string, positionMs: number = 0): Promise<void> {
    await this.stop() // ensure clean state

    this.currentParentSourceUri = parentSourceUri
    this.currentItem = item
    const ffmpegPath = this.opts.ffmpegPath ?? "ffmpeg"
    const pwCatPath = this.opts.pwCatPath ?? "pw-cat"

    const input = item.sourceRef.uri ?? item.sourceRef.sourceId
    if (!input) throw new Error("No input URI/path for item")

    const seekArgs = positionMs > 0 ? ["-ss", (positionMs / 1000).toString()] : []

    // ffmpeg: input → 16‑bit little‑endian PCM, 2ch, 48kHz
    const ffmpegArgs = [
      ...seekArgs,
      "-i",
      input,
      "-vn",
      "-f",
      "s16le",
      "-ac",
      "2",
      "-ar",
      "48000",
      "pipe:1",
    ]

    this.ffmpeg = spawn(ffmpegPath, ffmpegArgs, {
      stdio: ["ignore", "pipe", "inherit"],
    })

    this.pwcat = spawn(
      pwCatPath,
      [
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
      ],
      {
        stdio: ["pipe", "inherit", "inherit"],
      },
    )

    if (this.ffmpeg.stdout && this.pwcat.stdin) {
      this.ffmpeg.stdout.pipe(this.pwcat.stdin)
    }

    this.startedAt = Date.now() - positionMs
    this.pausedAt = null

    this.ffmpeg.on("exit", () => {
      this.cleanup()
    })

    this.pwcat.on("exit", () => {
      this.cleanup()
    })

    eventBus.emit({ type: "track_start", payload: { track: item, position: positionMs } })
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return
    if (!this.ffmpeg || !this.pwcat || this.pausedAt !== null) return
    this.pausedAt = await this.getPosition()
    await this.stop()
    eventBus.emit({
      type: "track_pause",
      payload: { track: this.currentItem, position: this.pausedAt },
    })
  }

  async stop(): Promise<void> {
    if (this.ffmpeg) {
      this.ffmpeg.kill("SIGTERM")
      this.ffmpeg = undefined
    }
    if (this.pwcat) {
      this.pwcat.kill("SIGTERM")
      this.pwcat = undefined
    }
    this.startedAt = null
    this.currentParentSourceUri = undefined
    this.currentItem = null
    eventBus.emit({ type: "track_stop", payload: {} })
  }

  async seek(positionMs: number): Promise<void> {
    // naive: stop and restart at new position
    if (!this.currentItem) return
    if (!this.startedAt && this.pausedAt === null) return
    const lastItem = this.lastItem
    if (!lastItem) return
    await this.play(lastItem, this.currentParentSourceUri, positionMs)
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
    await this.play(this.currentItem, this.currentParentSourceUri, position)
    eventBus.emit({ type: "track_start", payload: { track: this.currentItem, position: position } })
  }

  // ────────────────────────────────────────────────
  // minimal item tracking (for seek)
  // ────────────────────────────────────────────────

  private lastItem: MediaItem | null = null

  private cleanup() {
    this.ffmpeg = undefined
    this.pwcat = undefined
    this.startedAt = null
  }
}
