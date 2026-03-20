import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"
import { version as appversion } from "@/version"

export function registerVersionRoutes(app: FastifyInstance, _backend: VioxBackend) {
  app.get("/api/version", async (_req: any, reply: any) => {
    return reply.status(200).send({ version: appversion })
  })
}
