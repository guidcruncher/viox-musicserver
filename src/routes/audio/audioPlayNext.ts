import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "Play a track/album next",
  tags: ["Audio"],
  body: {
    type: "object",
    required: ["uri"],
    properties: {
      uri: { type: "string" },
    },
  },
  response: {
    200: { type: "object", properties: { status: { type: "string" } } },
  },
}

export async function audioPlayNext(app: FastifyInstance) {
  app.post("/play-next", { schema }, async (req: any, reply: any) => {
    const { uri } = req.body as any
    await audioControl.playNext(uri)
    reply.send({ status: "ok" })
  })
}
