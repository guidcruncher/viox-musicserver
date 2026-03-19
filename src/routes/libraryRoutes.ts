import type { FastifyInstance } from "fastify"
import type { VioxBackend } from "@/types"

export function registerLibraryRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/library", async (_req, res) => {
    const items = await backend.library.list()
    res.send(items)
  })

  app.get("/library/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.library.get(id)
    res.send(item)
  })

  app.get("/playlists", async (_req, res) => {
    const playlists = await backend.playlists.list()
    res.send(playlists)
  })

  app.get("/playlists/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const items = await backend.playlists.getItems(id)
    res.send(items)
  })
}
