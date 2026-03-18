// src/routes/spotify/libraryConsolidated.ts

import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryConsolidated(app: any) {
  // ------------------------------------------------------------
  // GET /spotify/library/consolidated
  // ------------------------------------------------------------
  app.get(
    "/spotify/library/consolidated",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
            type: { type: "string" }, // single type filter
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const { limit, offset, type } = req.query

      const result = await spotifyWebApi.libraryConsolidator.getLibraryPage({
        limit,
        offset,
        type,
      })

      reply.send(result)
    },
  )

  // ------------------------------------------------------------
  // POST /spotify/library/consolidated/refresh
  // ------------------------------------------------------------
  app.post(
    "/spotify/library/consolidated/refresh",
    {
      schema: {
        tags: ["Spotify"],
      },
    },
    async (_req: any, reply: any) => {
      await spotifyWebApi.libraryConsolidator.refresh()
      reply.send({ refreshed: true })
    },
  )
}
