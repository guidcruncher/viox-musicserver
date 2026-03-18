import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryAlbums(app: any) {
  app.get(
    "/spotify/library/albums",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
            market: { type: "string" },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      reply.send(await spotifyWebApi.library.getSavedAlbums(req.query))
    },
  )

  app.put(
    "/spotify/library/albums",
    {
      schema: {
        tags: ["Spotify"],
        body: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      await spotifyWebApi.library.saveAlbums(req.body.ids)
      reply.send({ saved: true })
    },
  )

  app.delete(
    "/spotify/library/albums",
    {
      schema: {
        tags: ["Spotify"],
        body: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      await spotifyWebApi.library.removeAlbums(req.body.ids)
      reply.send({ removed: true })
    },
  )

  app.get(
    "/spotify/library/albums/contains",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: { type: "string" },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const ids = req.query.ids.split(",")
      reply.send(await spotifyWebApi.library.checkSavedAlbums(ids))
    },
  )
}
