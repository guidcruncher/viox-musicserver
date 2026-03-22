import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerTuneInRoutes(app: FastifyInstance, backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering version routes")

  app.get("/api/tunein/browse/:guideId", async (req: any, reply: any) => {
    const { guideId } = req.params as any
    const source = backend.sources.get("tunein")

    if (source && source.browse) {
      const items = await source.browse({ kind: "children", cursor: guideId })
      reply.send(items)
    }

    reply.send([])
  })
}
