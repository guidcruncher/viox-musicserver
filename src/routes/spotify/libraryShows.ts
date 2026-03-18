import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryShows(app: any) {
  app.get(
    "/spotify/library/shows",
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
      reply.send(await spotifyWebApi.library.getSavedShows(req.query))
    },
  )

  app.put(
    "/spotify/library/shows",
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
      await spotifyWebApi.library.saveShows(req.body.ids)
      reply.send({ saved: true })
    },
  )

  app.delete(
    "/spotify/library/shows",
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
      await spotifyWebApi.library.removeShows(req.body.ids)
      reply.send({ removed: true })
    },
  )

  app.get(
    "/spotify/library/shows/contains",
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
      reply.send(await spotifyWebApi.library.checkSavedShows(ids))
    },
  )
}
