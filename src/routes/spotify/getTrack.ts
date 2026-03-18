// src/routes/spotify/getTrack.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export const getTrack = async (app: any) => {
  app.get(
    "/spotify/tracks/:id",
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
      const track = await spotifyWebApi.tracks.getTrack(id)
      return reply.send(track)
    },
  )
}
