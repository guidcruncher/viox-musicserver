import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { VioxBackend } from "@/types"

export function registerPodverseRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering podverse routes")

  app.get("/api/podverse/browse", async (req: any, reply: any) => {
    const { offset, limit, id } = req.query as any
    let categoryId = undefined

    if (id) {
      let item = await backend.cache.get(id)

      if (!item) item = await backend.library.get(id)

      if (item) categoryId = item.sourceRef?.sourceId ?? undefined
    }

    if (id && !categoryId) {
      reply.send({ ok: false, error: `Could not find a categoryId for ${id}` })
      return
    }

    const sourceAdapter = backend.sources.get("podverse")

    if (sourceAdapter && sourceAdapter.browse) {
      const items = await sourceAdapter.browse({
        kind: "children",
        cursor: categoryId,
        offset: offset,
        limit: limit,
      })
      if (items) {
        await backend.cache.upsert(items)
        reply.send(items)
        return
      }
    }

    reply.send([])
  })
}
