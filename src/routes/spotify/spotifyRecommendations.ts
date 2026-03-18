import { FastifyInstance } from "fastify"

import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

const schema = {
  tags: ["Spotify"],
  body: {
    type: "object",
    properties: {
      seed_artists: { type: "array", items: { type: "string" } },
      seed_tracks: { type: "array", items: { type: "string" } },
      seed_genres: { type: "array", items: { type: "string" } },
    },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: true,
    },
  },
}

export async function spotifyRecommendations(app: FastifyInstance) {
  app.post("/spotify/recommendations", { schema }, async (req: any, reply: any) => {
    const opts = req.body as any
    const recs = await spotifyWebApi.search.getRecommendations(opts)
    reply.send(recs)
  })
}
