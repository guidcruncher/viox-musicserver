// src/routes/spotify/getShow.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export const getShow = async (app: any) => {
  app.get(
    "/spotify/shows/:id/episodes",
    {
      schema: {
        tags: ["Spotify"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        querystring: {
          type: "object",
          required: ["offset", "limit"],
          properties: {
            offset: { type: "number", minimum: 0 },
            limit: { type: "number", minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const { id } = req.params as { id: string }
      const { offset, limit } = req.query as { offset: number; limit: number }

      const show = await spotifyWebApi.shows.getShowEpisodes(id, { offset: offset, limit: limit })
      return reply.send(show)
    },
  )

  app.get(
    "/spotify/shows/:id",
    {
      schema: {
        tags: ["Spotify"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    async (req: any, reply: any) => {
      const { id } = req.params as { id: string }
      const show = await spotifyWebApi.shows.getShow(id)
      return reply.send(show)
    },
  )
}
