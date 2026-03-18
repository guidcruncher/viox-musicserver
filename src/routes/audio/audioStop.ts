import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "stop endpoint",
  tags: ["Audio"],
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioStop(app: FastifyInstance) {
  app.post("/stop", { schema }, async (_req: any, reply: any) => {
    await audioControl.stop()
    reply.send({ status: "ok" })
  })
}
