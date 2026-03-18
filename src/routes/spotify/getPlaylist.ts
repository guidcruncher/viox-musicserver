// src/routes/spotify/getPlaylist.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export const getPlaylist = async (app: any) => {
  app.get(
    "/spotify/playlists/:id",
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
      const playlist = await spotifyWebApi.playlists.getPlaylist(id)
      return reply.send(playlist)
    },
  )
}
