import { FastifyInstance } from "fastify"

import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

const schema = {
  tags: ["Spotify"],
  body: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      additionalProperties: true,
    },
  },
}

export async function spotifyPlaylistTracks(app: FastifyInstance) {
  app.post("/spotify/playlist-tracks", { schema }, async (req: any, reply: any) => {
    const { id } = req.body as any
    const tracks = await spotifyWebApi.playlists.getPlaylistItems(id)
    reply.send(tracks)
  })
}
