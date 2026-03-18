import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "pause endpoint",
  tags: ["Audio"],
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioPause(app: FastifyInstance) {
  app.post("/pause", { schema }, async (_req: any, reply: any) => {
    await audioControl.pause()
    reply.send({ status: "ok" })
  })
}
