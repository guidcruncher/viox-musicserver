import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { SpotifyImportSchema } from "@/schemas"
import { fetchAndNormalizeBBCPlaylist } from "@/services/bbcPlaylistImporter"
import type { VioxBackend } from "@/types"

export function registerImportRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering import routes")

  app.post("/api/import/spotify", { schema: SpotifyImportSchema }, async (_req, res) => {
    await backend.importers.spotify.importUserLibrary()
    res.send({ ok: true })
  })

  app.post("/api/import/bbc", async (_req, res) => {
    const items = await fetchAndNormalizeBBCPlaylist()
    if (items && items.length > 0) {
      backend.radio.upsert(items)
    }

    res.send({ ok: true })
  })

  app.post("/api/import/spotify/:itemType", async (req, res) => {
    const { itemType } = req.params as any
    await backend.importers.spotify.importUserLibrary(itemType)
    res.send({ ok: true })
  })
}
