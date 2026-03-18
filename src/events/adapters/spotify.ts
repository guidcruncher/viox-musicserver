// adapters/spotify.ts
import WebSocket from "ws"

import { getLogger } from "../../logger"
import { eventBus } from "../bus"
import { normalizeSpotify } from "../normalizer"

export class SpotifyAdapter {
  constructor(private url: string) {}

  start() {
    const log = getLogger()
    try {
      const ws = new WebSocket(this.url)

      ws.addEventListener("error", (event) => {
        log.error("Websocket error in spotify event adapter", event)
      })

      ws.on("message", (data) => {
        const raw = JSON.parse(data.toString())
        const unified = normalizeSpotify(raw)
        unified.forEach((evt: any) => eventBus.emit(evt))
      })

      ws.on("error", (err) => {
        log.error("Websocket error in Spotfiy event adapter", err)
      })

      ws.on("close", () => setTimeout(() => this.start(), 2000))
    } catch (err) {
      log.error("Error starting spotify event adapter", err)
    }
  }
}
