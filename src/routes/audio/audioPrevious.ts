import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "previous-track endpoint",
  tags: ["Audio"],
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioPrevious(app: FastifyInstance) {
  app.post("/previous", { schema }, async (_req: any, reply: any) => {
    await audioControl.previous()
    reply.send({ status: "ok" })
  })
}
