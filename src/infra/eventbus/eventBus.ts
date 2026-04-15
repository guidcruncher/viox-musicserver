import { EventEmitter } from "node:events"

import { WebSocket } from "ws" // Import from 'ws' instead

import { logger } from "@/logger"

import { VioxCommandError, VioxCommandResponse, VioxEvent, VioxEventWrapper } from "./types"

// Store raw WebSocket objects
const clients: Set<WebSocket> = new Set()

class EventBus extends EventEmitter {
  registerClient(socket: WebSocket) {
    logger.info("Registering WebSocket client")
    clients.add(socket)

    socket.on("close", () => {
      logger.info("De-registering WebSocket client")
      clients.delete(socket)
    })

    socket.on("error", (err: Error) => {
      logger.error(`WebSocket error: ${err.message}`)
      clients.delete(socket)
    })
  }

  dispatchResponse(response: VioxCommandResponse | VioxCommandError) {
    const payload = JSON.stringify(response)

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

  dispatchEvent(event: VioxEvent) {
    const ev: VioxEventWrapper = { event: event }
    const payload = JSON.stringify(ev)
    logger.trace(`Dispatching event: ${event.type} payload: ${payload}`)
    this.emit(event.type, event.payload)

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
