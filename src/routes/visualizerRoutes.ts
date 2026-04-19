import { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { AudioService } from "@/services/fftService"
import type { VioxBackend } from "@/types"

export function registerVisualizerRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering visualiser routes")

  app.get("/api/ws/visualizer", { websocket: true }, (connection, _req) => {
    const audioService = AudioService.getInstance()

    // Define the broadcast callback for this specific socket
    const onData = (fftData: Float32Array) => {
      if (connection.readyState === 1) {
        connection.send(fftData.buffer)
      }
    }

    logger.info("Visualizer New client subscribed to singleton stream")
    audioService.addListener(onData)

    connection.on("close", () => {
      logger.info("Gisuaoizerv Client unsubscribed")
      audioService.removeListener(onData)
    })

    connection.on("error", () => {
      logger.error("Visualizer socket error")
      audioService.removeListener(onData)
    })
  })
}
