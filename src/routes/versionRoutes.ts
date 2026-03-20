import type { FastifyInstance } from "fastify"
import { version as appversion } from "../../version"

import type { VioxBackend } from "@/types"

export function registerVersionRoutes(app: FastifyInstance, _backend: VioxBackend) {
  app.get("/version", async (_req: any, reply: any) => {
    return reply.status(200).send({ version: appversion })
  })
}
