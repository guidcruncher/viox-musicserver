import { VioxEvent } from "./types"
import { WebSocket } from "ws" // Import from 'ws' instead

import { getLogger } from "../logger"
// Store raw WebSocket objects
const clients: Set<WebSocket> = new Set()

class EventBus {
  registerClient(socket: WebSocket) {
    const log = getLogger()
    log.info("Registering WebSocket client")
    clients.add(socket)

    socket.on("close", () => {
      log.info("De-registering WebSocket client")
      clients.delete(socket)
    })

    socket.on("error", (err: Error) => {
      log.error(`WebSocket error: ${err.message}`)
      clients.delete(socket)
    })
  }

  emit(event: VioxEvent) {
    const payload = JSON.stringify(event)

    if (clients.size > 0) {
      for (const socket of clients) {
        if (socket.readyState === 1) {
          // 1 is OPEN
          socket.send(payload)
        } else {
          clients.delete(socket)
        }
      }
    }
  }
}

export const eventBus = new EventBus()
