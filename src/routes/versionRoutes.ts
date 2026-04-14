import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"
import { Capabilities } from "@/types/caps"
import { version as appversion } from "@/version"

export function registerVersionRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering version routes")

  app.get("/api/version", async (_req: any, reply: any) => {
    return reply.status(200).send({ version: appversion })
  })

  app.get("/api/capabilities", async (_req: any, reply: any) => {
    return reply.status(200).send(Capabilities)
  })
}
