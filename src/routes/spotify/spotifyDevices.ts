import { FastifyInstance } from "fastify"

import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

const schema = {
  tags: ["Spotify"],
  response: {
    200: {
      type: "object",
    },
  },
}

export async function spotifyDevices(app: FastifyInstance) {
  app.get("/spotify/devices", { schema }, async (_req: any, reply: any) => {
    const devices = await spotifyWebApi.player.getDevices()
    reply.send({ devices })
  })
}
