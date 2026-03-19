import { randomUUID } from "node:crypto" // Built-in for unique IDs

import websocket from "@fastify/websocket"
import { FastifyInstance } from "fastify"

import { EVENT_KEYS,eventBus } from "./eventBus"

export const registerEventBus = async (app: FastifyInstance) => {
  app.register(websocket)

  app.get("/api/events", { websocket: true }, (connection, req) => {
    const connectionId = randomUUID()

    for (const eventName of EVENT_KEYS) {
      eventBus.subscribe(connectionId, eventName, (data: any) => {
        if (connection.readyState === 1) {
          connection.send(
            JSON.stringify({
              type: eventName,
              payload: data,
            }),
          )
        }
      })
    }

    connection.on("close", () => {
      eventBus.cleanup(connectionId)
    })
  })
}
