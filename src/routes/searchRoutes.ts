import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerSearchRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering search routes")

  app.get("/api/search/:source", async (req: any, reply: any) => {
    const { source } = req.params as any
    const { query, offset, limit } = req.query as any

    const sourceAdapter = backend.sources.get(source)

    if (sourceAdapter && sourceAdapter.browse) {
      const items = await sourceAdapter.search(query, offset, limit)
      if (items) {
        await backend.cache.upsert(items)
        reply.send(items)
        return
      }
    }

    reply.send([])
  })
}
