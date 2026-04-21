// adapters/spotify.ts

import { createVioxBackend } from "@/core/createBackend"
import { MpvClient } from "@/infra/backends/mpvClient"
import { logger } from "@/logger"

import { eventBus } from "../eventBus"
import { VioxEvent } from "../types"

export class MpvClientListener {
  private readonly backend = createVioxBackend()

  start() {
    try {
      const mpv = MpvClient.getInstance()

      // Listen for the custom event we created in processPropertyChange
      mpv.on("time-update", ({ current, total, percent }) => {
        let evt: VioxEvent
        evt = { type: "time-update", payload: { current, total, percent } }
        eventBus.dispatchEvent(evt)
      })
    } catch (err) {
      logger.error("Error starting golibrespot event listener", err)
    }
  }
}
