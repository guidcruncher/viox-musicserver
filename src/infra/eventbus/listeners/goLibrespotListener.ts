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

      ws.addEventListener("error", (event) => {
        logger.error("Websocket error in golibrespot event listener", event)
      })

      ws.on("message", async (data) => {
        const raw = JSON.parse(data.toString())
        let evt: VioxEvent | undefined = undefined

        switch (raw.event ?? raw.type) {
          case "active":
            evt = { type: "active", payload: undefined }
            break
          case "inactive":
            evt = { type: "inactive", payload: undefined }
            break
          case "metadata":
            const metaData: goLibrespotMetaData = raw
            evt = { type: "metadata", payload: metaData }
            break
          case "playing":
            const playing = (await this.getMediaItem(raw.uri)) ?? raw
            if (playing.resume) {
              evt = { type: "track_resume", payload: playing }
            } else {
              evt = { type: "track_start", payload: playing }
            }
            break
          case "will_play":
            const willPlay = (await this.getMediaItem(raw.uri)) ?? raw
            evt = { type: "track_change", payload: willPlay }
            break
          case "not_playing":
            eventBus.emit("finished", {})
            const notPlaying: goLibrespotNotPlaying = raw
            evt = { type: "track_stop", payload: notPlaying }
            break
          case "paused":
            const paused: goLibrespotPaused = raw
            evt = { type: "track_pause", payload: paused }
            break
          case "seek":
            const seek: goLibrespotSeek = raw
            evt = { type: "seek", payload: seek }
            break
        }

        if (evt) {
          eventBus.dispatchEvent(evt)
        }
      })

      ws.on("error", (err) => {
        logger.error("Websocket error in golibrespot event listener", err)
      })

      ws.on("close", () => setTimeout(() => this.start(), 2000))
    } catch (err) {
      logger.error("Error starting golibrespot event listener", err)
    }
  }
}
