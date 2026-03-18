import { FastifyInstance } from "fastify"

import { version as appversion } from "../../version"

const getSchema = {
  description: "Get server version",
  tags: ["Utility"],
}

export async function version(app: FastifyInstance) {
  app.get("/version", { schema: getSchema }, async (req: any, reply: any) => {
    return reply.status(200).send({ version: appversion })
  })
}
