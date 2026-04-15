import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { MediaItem, VioxBackend } from "@/types"

export function registerPodcastRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Podcast routes")

  app.get("/api/podcast/:id", async (req: any, reply: any) => {
    const podcast = await backend.podcastIndexer.getPodcast(req.params.id)
    if (!podcast) {
      reply.status(404).send({ error: "Podcast not found" })
      return
    }
    reply.send(podcast)
  })

  app.put("/api/podcast/episode/:id/listened", async (req: any, reply: any) => {
    const episode = await backend.podcastIndexer.markAsListened(req.params.id)
    if (!episode) {
      reply.status(404).send({ error: "Episode not found" })
      return
    }
    reply.send(episode)
  })

  app.post("/api/podcast/index", async (_req: any, reply: any) => {
    await backend.podcastIndexer.indexAll()
    reply.send({ success: true })
  })

  app.post("/api/podcast/index/:id", async (req: any, reply: any) => {
    const id = req.params.id
    await backend.podcastIndexer.indexOne(id)
    reply.send({ success: true })
  })

  app.post("/api/podcast/subscribe/:id", async (req: any, reply: any) => {
    const id = req.params.id
    const item: MediaItem = await backend.playback.resolveItem(id)

    if (!item) {
      reply.send({ success: false, error: "Item not found" })
      return
    }

    await backend.podcastIndexer.subscribe(item)
    reply.send({ success: true })
  })

  app.post("/api/podcast/unsubscribe/:id", async (req: any, reply: any) => {
    const id = req.params.id
    const item: MediaItem = await backend.playback.resolveItem(id)

    if (!item) {
      reply.send({ success: false, error: "Item not found" })
      return
    }

    await backend.podcastIndexer.unsubscribe(item)
    reply.send({ success: true })
  })
}
