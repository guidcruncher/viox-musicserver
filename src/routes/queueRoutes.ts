import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerQueueRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering queue routes")

  // GET /api/queue → return current queue
  app.get("/api/queue", async (_req: any, reply: any) => {
    try {
      const queue = await backend.playback.getQueue()
      return reply.status(200).send(queue)
    } catch (err) {
      logger.error("queue: failed to fetch queue", err)
      return reply.status(500).send({ error: "Failed to fetch queue" })
    }
  })

  app.post("/api/queue/:id", async (req: any, reply: any) => {
    const { id } = req.params as any

    try {
      const res = await backend.playback.selectTrack(id)
      return reply.status(200).send(res)
    } catch (err) {
      logger.error("queue: failed to select track at index", { err, id })
      return reply.status(500).send({ error: "Failed to select track at index" })
    }
  })

  app.delete("/api/queue/delete/:id", async (req: any, reply: any) => {
    const { id } = req.params as any
    try {
      const res = await backend.playback.deleteAtQueueIndex(id)
      return reply.status(200).send(res)
    } catch (err) {
      logger.error("queue: failed to select track at index", { err, id })
      return reply.status(500).send({ error: "Failed to select track at index" })
    }
  })

  app.delete("/api/queue/reset", async (_req: any, reply: any) => {
    await backend.queue.reset()
    await backend.playback.clearQueue()
    return reply.status(200).send({ status: "reset" })
  })

  // DELETE /api/queue → clear queue
  app.delete("/api/queue", async (_req: any, reply: any) => {
    try {
      await backend.queue.clear()
      await backend.playback.clearQueue()
      return reply.status(200).send({ status: "cleared" })
    } catch (err) {
      logger.error("queue: failed to clear queue", err)
      return reply.status(500).send({ error: "Failed to clear queue" })
    }
  })
}
