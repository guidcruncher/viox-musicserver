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

      let lastDispatch = 0
      const THROTTLE_MS = 5000

      mpv.on("time-update", ({ current, total, percent }) => {
        const now = performance.now()
        if (now - lastDispatch < THROTTLE_MS) return
        lastDispatch = now

        const evt: VioxEvent = {
          type: "time-update",
          payload: { current, total, percent },
        }

        eventBus.dispatchEvent(evt)
      })
    } catch (err) {
      logger.error("Error starting golibrespot event listener", err)
    }
  }
}
