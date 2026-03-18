import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "next-track endpoint",
  tags: ["Audio"],
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioNext(app: FastifyInstance) {
  app.post("/next", { schema }, async (_req: any, reply: any) => {
    await audioControl.next()
    reply.send({ status: "ok" })
  })
}
