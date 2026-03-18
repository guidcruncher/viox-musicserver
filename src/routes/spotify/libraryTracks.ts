import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryTracks(app: any) {
  app.get(
    "/spotify/library/tracks",
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
      const data = await spotifyWebApi.library.getSavedTracks(req.query)
      reply.send(data)
    },
  )

  app.put(
    "/spotify/library/tracks",
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
      await spotifyWebApi.library.saveTracks(req.body.ids)
      reply.send({ saved: true })
    },
  )

  app.delete(
    "/spotify/library/tracks",
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
      await spotifyWebApi.library.removeTracks(req.body.ids)
      reply.send({ removed: true })
    },
  )

  app.get(
    "/spotify/library/tracks/contains",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          required: ["ids"],
          properties: {
            ids: { type: "string" }, // comma-separated
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const ids = req.query.ids.split(",")
      const result = await spotifyWebApi.library.checkSavedTracks(ids)
      reply.send(result)
    },
  )
}
