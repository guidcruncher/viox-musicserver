import fastifyWebsocket from "@fastify/websocket" // Import the plugin correctly
import { FastifyInstance } from "fastify"

import { eventBus } from "./eventBus"
import { GoLibrespotListener } from "./listeners/goLibrespotListener"
import { getLogger } from "@/logger"

export async function registerEventBus(fastify: FastifyInstance) {
  const logger = getLogger()
  try {
    // 1. Register the plugin directly on the main instance
    // The 'websocket' property becomes available on routes after this
    logger.debug("Registering websocket plugin")
    await fastify.register(fastifyWebsocket, {
      options: {
        maxPayload: 1048576,
        clientTracking: true,
      },
    })

    // 2. Define the WebSocket route
    // We use the 'connection' object which contains the raw socket
    fastify.get("/api/events", { websocket: true }, (connection) => {
      try {
        logger.debug("Registering websocket client")
        const socket = connection

        // Register the raw socket with our event bus
        eventBus.registerClient(socket)

        // Handle incoming messages (typed as Buffer by the 'ws' library)
        socket.on("message", (message: Buffer) => {
          logger.info(`Received message from client: ${message.toString()}`)
        })

        socket.on("error", (err: any) => {
          logger.error("WebSocket error", err)
        })
      } catch (err) {
        logger.error("Error registering Websocket client", err)
      }
    })

//    new GoLibrespotListener().start()
  } catch (err) {
    logger.error("Error registering EventBus", err)
  }
}
