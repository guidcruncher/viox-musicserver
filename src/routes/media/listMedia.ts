// src/routes/media/listMedia.ts
import { MediaItemSchema } from "@/schemas"

import { historyRepository } from "../../repositories/historyRepository"
import { presetRepository } from "../../repositories/presetRepository"

export async function listMedia(app: any) {
  app.get(
    "/media/presets",
    {
      schema: {
        tags: ["Media"],
        response: {
          200: {
            type: "array",
            items: MediaItemSchema,
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const items = presetRepository.findAll()
      items.forEach((t: any) => {
        t.favourite = true
      })
      return reply.send(items)
    },
  )

  app.get(
    "/media/history",
    {
      schema: {
        tags: ["Media"],
        response: {
          200: {
            type: "array",
            items: MediaItemSchema,
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const limit = parseInt(req.query.limit) || 20
      const items = historyRepository.findAllHistory(limit)

      return reply.send(presetRepository.setFavouriteFlagOnList(items))
    },
  )
}
