// src/routes/spotify/getAlbum.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export const getAlbum = async (app: any) => {
  app.get(
    "/spotify/albums/:id",
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
      const album = await spotifyWebApi.albums.getAlbum(id)
      return reply.send(album)
    },
  )
}
