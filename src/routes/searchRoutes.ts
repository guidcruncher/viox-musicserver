import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerSearchRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/search", async (req, res) => {
    const { q } = req.query as { q: string }
    const results = await backend.search.search(q)
    res.send(results)
  })
}
