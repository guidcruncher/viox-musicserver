import { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { AudioService } from "@/services/fftService"
import type { VioxBackend } from "@/types"

export function registerVisualizerRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering visualiser routes")

app.get("/api/ws/visualizer", { websocket: true }, (connection, _req) => {
  try {
    const audioService = AudioService.getInstance()
    
    // Destructure socket for cleaner code
    const { socket } = connection;

    const onData = (fftData: Float32Array) => {
      // Use socket.readyState (1 is OPEN)
      if (socket.readyState === 1) {
        socket.send(fftData.buffer)
      }
    }

    logger.info("Visualizer: New client subscribed")
    audioService.addListener(onData)

    // Use socket.on instead of connection.on
    socket.on("close", () => {
      logger.info("Visualizer: Client unsubscribed")
      audioService.removeListener(onData)
    })

    socket.on("error", (err) => {
      logger.error("Visualizer socket error", err)
      audioService.removeListener(onData)
    })
    
  } catch (err) {
    logger.error("Error in visualizer", err)
  }
})



}
