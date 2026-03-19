import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerImportRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.post("/api/import/spotify", async (_req, res) => {
    await backend.importers.spotify.importUserPlaylists()
    res.send({ ok: true })
  })
}
