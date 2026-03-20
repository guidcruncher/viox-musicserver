import type { FastifyInstance } from "fastify"

import { BackendsListSchema, BackendStatusSchema } from "@/schenas"
import type { VioxBackend } from "@/types"

export function registerBackendStatusRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/api/status", { schema: BackendStatusSchema }, async (_req, res) => {
    const status = await backend.status.get()
    res.send(status)
  })

  app.get("/api/backends", { schema: BackendsListSchema }, async (_req, res) => {
    const list = backend.backends.list()
    res.send(list)
  })
}
