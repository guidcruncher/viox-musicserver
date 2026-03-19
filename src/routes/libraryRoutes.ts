import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerLibraryRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/api/library", async (req, res) => {
    const { offset, limit } = req.query as any
    let items

    if (offset) {
      items = await backend.library.listWithPaging(Number(offset), Number(limit ?? 100))
    } else {
      items = await backend.library.list()
    }

    res.send(items)
  })

  app.get("/api/library/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.library.get(id)
    res.send(item)
  })

  app.get("/api/playlists", async (_req, res) => {
    const playlists = await backend.playlists.list()
    res.send(playlists)
  })

  app.get("/api/playlists/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const items = await backend.playlists.getItems(id)
    res.send(items)
  })
}
