import { randomUUID } from "node:crypto"

import websocket from "@fastify/websocket"
import { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"

import { EVENT_KEYS, eventBus } from "./eventBus"

export const registerEventBus = async (app: FastifyInstance) => {
  app.register(websocket)

  app.get("/api/events", { websocket: true }, (connection, _req) => {
    const ws = connection
    const connectionId = randomUUID()
    const logger = getLogger()

    ws.on("message", (message: Buffer) => {
      logger.info(`Received message from client: ${message.toString()}`)
    })

    for (const eventName of EVENT_KEYS) {
      eventBus.subscribe(connectionId, eventName, (data: any) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(
            JSON.stringify({
              type: eventName,
              payload: data,
            }),
          )
        }
      })
    }

    ws.on("error", (err: any) => {
      logger.error("WebSocket error", err)
    })

    ws.on("close", () => {
      logger.info("Client closed connection")
      eventBus.cleanup(connectionId)
    })
  })
}
