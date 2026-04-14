import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"
import { Capabilities, CapabilitySourceKey } from "@/types"

export function registerCatalogRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Catalog routes")

  app.get("/api/catalog", async (_req: any, reply: any) => {
    const caps: any[] = []
    Object.keys(Capabilities.audioSources).forEach((key: any) => {
      const cap = Capabilities.audioSources[key as CapabilitySourceKey] as any
      if (cap.browsable || cap.searchable) {
        caps.push({ id: key, name: cap.name, initialFilter: cap.initialBrowseSourceId })
      }
    })

    reply.status(200).send(caps.sort())
  })

  app.get("/api/catalog/browse/:source", async (req: any, reply: any) => {
    const { source } = req.params as any
    const { itemtype, offset, limit, id } = req.query as any
    const cap = Capabilities.audioSources[source as CapabilitySourceKey] as any

    if (!cap) {
      reply.status(400).send({ ok: false, message: `Bad request unknown source ${source}` })
      return
    }

    if (!cap.browsable) {
      reply.status(400).send({ ok: false, message: `Source ${source} not browsable` })
      return
    }

    const sourceAdapter = backend.sources.get(source)

    if (sourceAdapter && sourceAdapter.browse) {
      const items = await sourceAdapter.browse({
        kind: itemtype ?? "children",
        cursor: id,
        offset: offset,
        limit: limit,
      })
      if (items) {
        await backend.cache.upsert(items)
        reply.send(items)
      }
    }

    reply.send([])
  })
}
