import fastifyWebsocket from "@fastify/websocket" // Import the plugin correctly
import { FastifyInstance } from "fastify"

import { eventBus } from "./eventBus"
import { GoLibrespotListener } from "./listeners/goLibrespotListener"

export async function registerEventBus(fastify: FastifyInstance) {
  // 1. Register the plugin directly on the main instance
  // The 'websocket' property becomes available on routes after this
  await fastify.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576,
      clientTracking: true,
    },
  })

  // 2. Define the WebSocket route
  // We use the 'connection' object which contains the raw socket
  fastify.get("/api/events", { websocket: true }, (connection) => {
    const socket = connection

    // Register the raw socket with our event bus
    eventBus.registerClient(socket)

    // Handle incoming messages (typed as Buffer by the 'ws' library)
    socket.on("message", (message: Buffer) => {
      fastify.log.info(`Received message from client: ${message.toString()}`)
    })

    socket.on("error", (err: any) => {
      fastify.log.error(err, "WebSocket error")
    })
  })

  new GoLibrespotListener().start()
}
