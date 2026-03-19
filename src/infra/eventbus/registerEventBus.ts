import { FastifyInstance } from "fastify"
import websocket from "@fastify/websocket"
import { eventBus, EVENT_KEYS } from "./eventBus"
import { randomUUID } from "node:crypto" // Built-in for unique IDs
import { getLogger } from "@/logger"

export const registerEventBus = async (app: FastifyInstance) => {
  app.register(websocket)

  app.get("/api/events", { websocket: true }, (connection) => {
    const connectionId = randomUUID()

    for (const eventName of EVENT_KEYS) {
      eventBus.subscribe(connectionId, eventName, (data:any) => {
        if (connection.socket.readyState === 1) {
          connection.socket.send(
            JSON.stringify({
              type: eventName,
              payload: data,
            }),
          )
        }
      })
    }

    connection.socket.on("close", () => {
      eventBus.cleanup(connectionId)
    })
  })
}
