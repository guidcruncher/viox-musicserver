// Import the plugin correctly
import { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { AudioService } from "@/services/fftService"

export async function registerVisualizer(fastify: FastifyInstance) {
  // 2. Define the WebSocket route
  // We use the 'connection' object which contains the raw socket
  fastify.get("/api/fft", { websocket: true }, (connection) => {
    const socket = connection
    const audioService = AudioService.getInstance()

    const onData = (fftData: Float32Array) => {
      if (socket.readyState === 1) {
        socket.send(fftData.buffer)
      }
    }

    logger.info("Visualizer: New client subscribed")
    audioService.addListener(onData)

    socket.on("close", () => {
      logger.info("Visualizer: Client unsubscribed")
      audioService.removeListener(onData)
    })

    socket.on("error", (err: Error) => {
      logger.error("Visualizer socket error", err)
      audioService.removeListener(onData)
    })
  })
}
