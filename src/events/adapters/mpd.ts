// adapters/mpd.ts
import net from "net"

import { getLogger } from "../../logger"
import { mpdClient } from "../../services/mpd/mpdClient"
import { eventBus } from "../bus"
import { normalizeMPD } from "../normalizer"

export class MPDAdapter {
  private client: net.Socket | null = null

  start() {
    const log = getLogger()
    try {
      this.client = net.createConnection(6600, "127.0.0.1")

      this.client.on("error", (err) => {
        log.error("Error in mpd event adapter", err)
      })

      this.client.on("connect", () => {
        this.sendIdle()
      })

      this.client.on("data", async (data) => {
        const lines = data.toString().trim().split("\n")

        for (const line of lines) {
          if (line.startsWith("changed:")) {
            const changed = line.replace("changed:", "").trim()

            const status = await mpdClient.status()
            const song = await mpdClient.currentSong()

            const unified = normalizeMPD(changed, status, song)
            unified.forEach((evt: any) => eventBus.emit(evt))

            this.sendIdle()
          }
        }
      })

      this.client.on("close", () => setTimeout(() => this.start(), 2000))
    } catch (err) {
      log.error("Error opening mpd event adapter", err)
    }
  }

  private sendIdle() {
    this.client?.write("idle player mixer playlist options update\n")
  }
}
