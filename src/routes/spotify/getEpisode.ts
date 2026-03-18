// src/routes/spotify/getEpisode.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export const getEpisode = async (app: any) => {
  app.get(
    "/spotify/episodes/:id",
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
      const episode = await spotifyWebApi.episodes.getEpisode(id)
      return reply.send(episode)
    },
  )
}
