import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function libraryAudiobooks(app: any) {
  app.get(
    "/spotify/library/audiobooks",
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
      reply.send(await spotifyWebApi.library.getSavedAudiobooks(req.query))
    },
  )

  app.put(
    "/spotify/library/audiobooks",
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
      await spotifyWebApi.library.saveAudiobooks(req.body.ids)
      reply.send({ saved: true })
    },
  )

  app.delete(
    "/spotify/library/audiobooks",
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
      await spotifyWebApi.library.removeAudiobooks(req.body.ids)
      reply.send({ removed: true })
    },
  )

  app.get(
    "/spotify/library/audiobooks/contains",
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
      reply.send(await spotifyWebApi.library.checkSavedAudiobooks(ids))
    },
  )
}
