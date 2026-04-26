// infra/backends/podverse-backend.ts
import { eventBus } from "@/infra/eventbus/eventBus"
import { logger } from "@/logger"
import type { MediaItem, PlaybackBackend } from "@/types"
import { config } from "@/config"

import { MpvClient } from "./mpvClient"

export class RadioPlaybackBackend implements PlaybackBackend {
  readonly id = "radio"

  private ffplay: MpvClient = MpvClient.getInstance()
  private startedAt: number | null = null
  private pausedAt: number | null = null
  private currentItem: MediaItem | null = null
  private currentParentSourceUri: string | undefined = undefined

  constructor() {
    this.ffplay.on("metadata", (msg: any) => {
      logger.info("Now Streaming:", msg.data)
    })

    this.ffplay.on("start-file", () => {
      if (this.currentItem && this.startedAt !== null) {
        eventBus.dispatchEvent({
          type: "track_start",
          payload: { track: this.currentItem, position: this.startedAt },
        })
      }
    })

    this.ffplay.on("finished", () => {
      if (!this.currentItem) return
      eventBus.dispatchEvent({ type: "finished", payload: {} })
    })

    this.ffplay.on("stopped", () => {
      eventBus.dispatchEvent({ type: "track_stop", payload: {} })
    })
  }

  async play(item: MediaItem, parentSourceUri?: string, positionMs = 0): Promise<void> {
    await this.stop()

    this.currentParentSourceUri = parentSourceUri
    this.currentItem = item

    const url = item.sourceRef.uri
    if (!url) throw new Error("Radio backend: no media URL")

if (!config["dontProxyRadioStreams"]) {
    const proxiedUrl = `http://127.0.0.1:8080/api/proxy?url=${encodeURIComponent(url)}&source=${item.sourceRef.source}`

    logger.debug(`Original playback URL ${url}`)
    logger.debug(`Proxied playback URL ${proxiedUrl}`)

    this.startedAt = Date.now() - positionMs
    this.pausedAt = null

    await this.ffplay.play(proxiedUrl)
return 
}

  logger.debug(`Direct playback URL ${url}`)
    this.startedAt = Date.now() - positionMs
    this.pausedAt = null
    await this.ffplay.play(url)
  }

  async pause(): Promise<void> {
    if (!this.currentItem || this.pausedAt !== null) return

    this.pausedAt = await this.getPosition()
    await this.ffplay.pause()

    eventBus.dispatchEvent({
      type: "track_pause",
      payload: { track: this.currentItem, position: this.pausedAt },
    })
  }

  async stop(): Promise<void> {
    await this.ffplay.stop()
    this.startedAt = null
    this.currentParentSourceUri = undefined
    this.currentItem = null
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentItem) return
    await this.play(this.currentItem, this.currentParentSourceUri, positionMs)

    eventBus.dispatchEvent({
      type: "seek",
      payload: { track: this.currentItem, position: positionMs },
    })
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

    await this.ffplay.resume()

    eventBus.dispatchEvent({
      type: "track_start",
      payload: { track: this.currentItem, position },
    })
  }
}
