import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import { SpotifyImportSchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerImportRoutes(app: FastifyInstance, backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering import routes")

  app.post("/api/import/spotify", { schema: SpotifyImportSchema }, async (_req, res) => {
    await backend.importers.spotify.importUserLibrary()
    res.send({ ok: true })
  })

  app.post("/api/import/spotify/:itemType", async (req, res) => {
    const { itemType } = req.params as any
    await backend.importers.spotify.importUserLibrary(itemType)
    res.send({ ok: true })
  })
}
