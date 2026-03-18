import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryPlaylist(app: any) {
  app.get(
    "/spotify/library/playlists",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const data = await spotifyWebApi.library.getSavedPlaylists(req.query)
      reply.send(data)
    },
  )
}
