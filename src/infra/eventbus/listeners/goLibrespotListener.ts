// adapters/spotify.ts
import WebSocket from "ws"

import { getLogger } from "@/logger"
import { eventBus } from "../eventBus"

export class GoLibrespotListener {

  start() {
    const log = getLogger()
    try {
      const ws = new WebSocket("ws://127.0.0.1/events")

      ws.addEventListener("error", (event) => {
        log.error("Websocket error in GoLibrespot Listener", event)
      })

      ws.on("message", (data) => {
        const raw = JSON.parse(data.toString())
        const unified = normalizeSpotify(raw)
        unified.forEach((evt: any) => eventBus.emit(evt))
      })

      ws.on("error", (err) => {
   log.error("Websocket error in GoLibrespot Listener", event)
      })

      ws.on("close", () => setTimeout(() => this.start(), 2000))
    } catch (err) {
      log.error("Error starting GoLibrespot Listener", err)
    }
  }
}
