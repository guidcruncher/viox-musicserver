import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { BrowseTuneInSchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerRadioPluginRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering radio plugin routes")

  app.get(
    "/api/radio/browse/:source/:guideId",
    { schema: BrowseTuneInSchema },
    async (req: any, reply: any) => {
      const { source, guideId } = req.params as any
      const { offset, limit } = req.query as any

      const sourceAdapter = backend.sources.get(source)

      if (sourceAdapter && sourceAdapter.browse) {
        const items = await sourceAdapter.browse({
          kind: "children",
          cursor: guideId,
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
    },
  )
}
