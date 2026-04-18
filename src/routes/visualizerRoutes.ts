import { FastifyInstance, FastifyRequest } from "fastify"
import { AudioService } from "@/services/fftService"
import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerVisualizerRoutes(app: FastifyInstance, _backend: VioxBackend) {
  app.get("/ws/visualizer", { websocket: true }, (connection, req: FastifyRequest) => {
    const audioService = new AudioService()

    logger.info("Client connected to FFT stream")

    // Start the stream and send data to this specific client
    audioService.streamFFT((fftData) => {
      if (connection.socket.readyState === connection.socket.OPEN) {
        // Sending as raw binary for maximum performance
        connection.socket.send(fftData.buffer)
      }
    })

    // Cleanup when this specific client closes the tab
    connection.socket.on("close", () => {
      audioService.stop()
      logger.info("Client disconnected, stream stopped")
    })

    connection.socket.on("error", (err) => {
      logger.error("Error in visualizer", err)
      audioService.stop()
    })
  })
}
