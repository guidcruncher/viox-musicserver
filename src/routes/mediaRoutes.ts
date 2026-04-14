import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { AudioSourceAdapter, MediaItem, VioxBackend } from "@/types"

export function registerMediaRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering media routes")

  app.get("/api/media/:id/items", async (req: any, reply: any) => {
    const { offset, limit } = req.query as any
    const { id } = req.params as any
    let item = await backend.library.get(id)

    if (!item) {
      item = await backend.cache.get(id)
      if (!item) {
        logger.warn(`Item with id ${id} not found in library or cache`)
        reply.send([])
        return
      }
    }

    const sourceAdapter: AudioSourceAdapter | undefined = backend.sources.get(item.sourceRef.source)

    if (!sourceAdapter) {
      logger.warn(`No source adapter found for source ${item.sourceRef.source}`)
      reply.send([])
      return
    }

    let items: MediaItem[] | undefined

    if (item.sourceRef.itemType == "album") {
      items = await backend.track.listByParentSourceIdWithPaging(
        item.sourceRef.sourceId,
        offset,
        limit,
      )
      if (!items || items.length == 0) {
        items = await sourceAdapter.getItems(item.sourceRef, offset, limit)
      }
    } else {
      items = await sourceAdapter.getItems(item.sourceRef, offset, limit)
    }

    if (items) {
      await backend.cache.upsert(items)
      reply.send(items)
    }

    logger.warn(`No items found for item with id ${id}`)
    return []
  })
}
