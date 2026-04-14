import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { VioxBackend } from "@/types"

export function registerLocalRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering local routes")

  app.get("/api/local/browse", async (req: any, reply: any) => {
    const { offset, limit, id } = req.query as any
    let relPath = undefined

    if (id) {
      let item = await backend.cache.get(id)

      if (!item) item = await backend.library.get(id)

      if (item) relPath = item.sourceRef?.sourceId ?? undefined
    }

    const sourceAdapter = backend.sources.get("local")

    if (sourceAdapter && sourceAdapter.browse) {
      const items = await sourceAdapter.browse({
        kind: "children",
        cursor: relPath,
        offset: offset,
        limit: limit,
      })
      if (items) {
        reply.send(items)
      }
    }

    reply.send([])
  })
}
