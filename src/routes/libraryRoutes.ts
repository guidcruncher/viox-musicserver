import type { FastifyInstance } from "fastify"

import { API_DEFAULT_PAGESIZE } from "@/config"
import { logger } from "@/logger"
import { ListLibrarySchema } from "@/schemas"
import type { VioxBackend } from "@/types"
import { normalizeType } from "@/utils"

export function registerLibraryRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Library routes")

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
          items = await backend.library.listWithPaging(
            Number(offset),
            Number(limit ?? API_DEFAULT_PAGESIZE),
          )
        } else {
          items = await backend.library.list()
        }
      }

      res.send(items)
    },
  )

  app.get("/api/library/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item: any = await backend.playback.resolveItem(id)

    if (!item) {
      res.code(404).send({ error: "Item not found" })
      return
    }

    const subscribed = await backend.podcastIndexer.isSubscribed(item.id)

    if (subscribed) {
      item.subscribed = true
    }

    res.send(item)
  })

  app.post("/api/library/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.cache.get(id)
    if (item) {
      await backend.library.upsert([item])
      await backend.cache.remove(item.id)
      res.send(item)
      return
    }
    res.send({})
  })

  app.delete("/api/library/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.library.get(id)
    if (item) {
      await backend.library.remove(item.id)
      res.send(item)
      return
    }
    res.send({})
  })

  app.get("/api/playlists", async (req, res) => {
    const { offset, limit } = req.query as any
    let playlists

    if (offset) {
      playlists = await backend.playlists.listPaged(
        Number(offset),
        Number(limit ?? API_DEFAULT_PAGESIZE),
      )
    } else {
      playlists = await backend.playlists.list()
    }

    res.send(playlists)
  })

  app.get("/api/playlist/:id", async (req, res) => {
    const { id } = req.params as { id: string }
    const item = await backend.playlists.get(id)
    res.send(item)
  })

  app.get("/api/playlists/:id/items", async (req, res) => {
    const { id } = req.params as { id: string }
    const { offset, limit } = req.query as any
    let items

    if (offset) {
      items = await backend.playlists.getItemsPaged(
        id,
        Number(offset),
        Number(limit ?? API_DEFAULT_PAGESIZE),
      )
    } else {
      items = await backend.playlists.getItems(id)
    }

    res.send(items)
  })
}
