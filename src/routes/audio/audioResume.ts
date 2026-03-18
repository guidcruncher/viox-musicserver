import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "resume endpoint",
  tags: ["Audio"],
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioResume(app: FastifyInstance) {
  app.post("/resume", { schema }, async (_req: any, reply: any) => {
    await audioControl.resume()
    reply.send({ status: "ok" })
  })
}
