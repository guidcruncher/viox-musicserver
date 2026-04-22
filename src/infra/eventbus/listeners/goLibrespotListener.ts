// adapters/spotify.ts
import WebSocket from "ws"

import { createVioxBackend } from "@/core/createBackend"
import { logger } from "@/logger"
import { AudioSource, AudioSourceItemType } from "@/types"

import { eventBus } from "../eventBus"
import { VioxEvent } from "../types"
import {
  goLibrespotMetaData,
  goLibrespotNotPlaying,
  goLibrespotPaused,
  goLibrespotSeek,
} from "./types"

export class GoLibrespotListener {
  private readonly backend = createVioxBackend()

  // --- PROGRESS TRACKING STATE ---
  private currentTimeMs: number = 0
  private durationMs: number = 0
  private isPlaying: boolean = false
  private ticker: NodeJS.Timeout | null = null

  /**
   * Calculates and emits progress in the same format as the MPV client
   */
  private emitProgress() {
    const percent = this.durationMs > 0 ? (this.currentTimeMs / this.durationMs) * 100 : 0

    eventBus.dispatchEvent({
      type: "time-update",
      payload: {
        current: Math.floor(this.currentTimeMs / 1000), // Seconds for MPV parity
        total: Math.floor(this.durationMs / 1000), // Seconds for MPV parity
        percent: percent,
        rawMs: this.currentTimeMs,
      },
    })
  }

  private startTicker() {
    if (this.ticker) return
    // Tick every 500ms for a smoother UI than 1s
    this.ticker = setInterval(() => {
      if (this.isPlaying) {
        this.currentTimeMs += 500
        this.emitProgress()
      }
    }, 500)
  }

  private stopTicker() {
    if (this.ticker) {
      clearInterval(this.ticker)
      this.ticker = null
    }
  }

  getMediaItem = async (uri: string): Promise<any | undefined> => {
    if (!uri) return undefined
    const parts = uri.split(":")
    const source = this.backend.sources.get(parts[0] as AudioSource)
    if (!source) return undefined

    const res = await source.getById({
      source: parts[0] as AudioSource,
      itemType: parts[1] as AudioSourceItemType,
      sourceId: parts[2],
      uri: uri,
    })

    if (res) {
      await this.backend.cache.upsert([res])
    }
    return res
  }

  start() {
    try {
      const ws = new WebSocket("ws://127.0.0.1:3678/events")

      ws.on("message", async (data) => {
        const raw = JSON.parse(data.toString())
        let evt: VioxEvent | undefined = undefined

        switch (raw.event ?? raw.type) {
          case "metadata":
            const metaData: goLibrespotMetaData = raw
            this.durationMs = metaData.duration // Capture total track length
            evt = { type: "metadata", payload: metaData }
            break

          case "playing":
            this.isPlaying = true
            const playing = (await this.getMediaItem(raw.uri)) ?? raw

            // Only reset time to 0 if it's a new track (not a resume)
            if (!raw.resume) {
              this.currentTimeMs = 0
            }

            this.startTicker()
            evt = { type: raw.resume ? "track_resume" : "track_start", payload: playing }
            break

          case "paused":
            this.isPlaying = false
            // Keep the ticker running but it won't increment because isPlaying is false
            // or stop it to save resources:
            this.stopTicker()
            const paused: goLibrespotPaused = raw
            evt = { type: "track_pause", payload: paused }
            break

          case "seek":
            const seek: goLibrespotSeek = raw
            this.currentTimeMs = seek.position // Update internal clock to seek target
            this.emitProgress() // Push update immediately for UI responsiveness
            evt = { type: "seek", payload: seek }
            break

          case "not_playing":
            this.isPlaying = false
            this.currentTimeMs = 0
            this.stopTicker()
            this.emitProgress() // Reset UI to 0
            eventBus.emit("finished", {})
            const notPlaying: goLibrespotNotPlaying = raw
            evt = { type: "track_stop", payload: notPlaying }
            break

          case "active":
            evt = { type: "active", payload: undefined }
            break
          case "inactive":
            this.stopTicker()
            evt = { type: "inactive", payload: undefined }
            break
        }

        if (evt) {
          eventBus.dispatchEvent(evt)
        }
      })

      ws.on("error", (err) => {
        logger.error("Websocket error in golibrespot event listener", err)
        this.stopTicker()
      })

      ws.on("close", () => {
        this.stopTicker()
        setTimeout(() => this.start(), 2000)
      })
    } catch (err) {
      logger.error("Error starting golibrespot event listener", err)
      this.stopTicker()
    }
  }
}
