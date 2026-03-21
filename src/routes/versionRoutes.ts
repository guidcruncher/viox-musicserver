import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import type { VioxBackend } from "@/types"
import { version as appversion } from "@/version"

export function registerVersionRoutes(app: FastifyInstance, _backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering version routes")

  app.get("/api/version", async (_req: any, reply: any) => {
    return reply.status(200).send({ version: appversion })
  })
}
