import fastifyWebsocket from "@fastify/websocket" // Import the plugin correctly
import { FastifyInstance } from "fastify"

import { logger } from "@/logger"

import { eventBus } from "./eventBus"
import { GoLibrespotListener } from "./listeners/goLibrespotListener"
import { MpvClientListener } from "./listeners/mpvClientListener"
import { VioxCommand } from "./types"

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
      try {
        const raw: any = message.toString()
        if (!raw) return

        const json: VioxCommand = JSON.parse(raw)
        if (!json || !json.command || !json.request_id) return
      } catch {
        logger.warn(`Received invalid message on event bus "${message.toString()}"`)
      }
    })

    socket.on("error", (err: any) => {
      logger.error(err, "WebSocket error")
    })
  })

  // 3. Initialize listeners
  new GoLibrespotListener().start()
  new MpvClientListener().start()
}
