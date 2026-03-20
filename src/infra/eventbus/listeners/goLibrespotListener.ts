// adapters/spotify.ts
import WebSocket from "ws"

import { getLogger } from "@/logger"

import { eventBus } from "../eventBus"
import { VioxEvent } from "../types"

export class GoLibrespotListener {
  start() {
    const log = getLogger()
    try {
      const ws = new WebSocket("ws://127.0.0.1:3678/events")

      ws.addEventListener("error", (event) => {
        log.error("Websocket error in golibrespot event listener", event)
      })

      ws.on("message", (data) => {
        const raw = JSON.parse(data.toString())
        const evt: VioxEvent | undefined = undefined

        switch (raw.event ?? raw.type) {
          case "active":
            break
          case "inactive":
            break
          case "metadata":
            break
          case "will_play":
            break
          case "resume":
            break
          case "paused":
            break
          case "seek":
            break
          case "volume":
            break
          case "shuffle_context":
            break
          case "repeat_context":
            break
          case "repeat_track":
            break
        }

        if (evt) {
          eventBus.emit(evt)
        }
      })

      ws.on("error", (err) => {
        log.error("Websocket error in golibrespot event listener", err)
      })

      ws.on("close", () => setTimeout(() => this.start(), 2000))
    } catch (err) {
      log.error("Error starting golibrespot event listener", err)
    }
  }
}
