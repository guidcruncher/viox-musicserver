import type { FastifyInstance } from "fastify"

import { GetLibraryItemSchema, ListLibrarySchema } from "@/schemas"
import type { VioxBackend } from "@/types"
import { normalizeType } from "@/utils"

export function registerLibraryRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get(
    "/api/library",
    { schema: ListLibrarySchema, preHandler: normalizeType },
    async (req, res) => {
      const { type, offset, limit } = req.query as any
      let items

      if (type) {
        if (offset) {
          items = await backend.library.listByItemTypesWithPaging(
            type,
            Number(offset),
            Number(limit ?? 100),
          )
        } else {
          items = await backend.library.listByItemTypes(type)
        }
      } else {
        if (offset) {
          items = await backend.library.listWithPaging(Number(offset), Number(limit ?? 100))
        } else {
          items = await backend.library.list()
        }
      }

      res.send(items)
    },
  )

  app.get("/api/library/:id", { schema: GetLibraryItemSchema }, async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.library.get(id)
    res.send(item)
  })
  app.get("/api/playlists", async (req, res) => {
    const { offset, limit } = req.query as any
    let playlists

    if (offset) {
      playlists = await backend.playlists.listPaged(offset, limit)
    } else {
      playlists = await backend.playlists.list()
    }
    res.send(playlists)
  })

  app.get("/api/playlists/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const { offset, limit } = req.query as any
    let items

    if (offset) {
      items = await backend.playlists.getItemsPaged(id, offset, limit)
    } else {
      items = await backend.playlists.getItems(id)
    }

    res.send(items)
  })
}
