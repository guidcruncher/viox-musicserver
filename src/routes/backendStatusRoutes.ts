import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerBackendStatusRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/status", async (_req, res) => {
    const status = await backend.status.get()
    res.send(status)
  })

  app.get("/backends", async (_req, res) => {
    const list = backend.backends.list()
    res.send(list)
  })
}
