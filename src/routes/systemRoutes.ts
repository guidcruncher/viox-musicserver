import type { FastifyInstance } from "fastify"

import { PipewireTopService } from "@/infra/playback/pipewireTopUtility"
import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerSystemRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering System routes")

  app.get("/api/system/backup", async (_req: any, reply: any) => {
    logger.info("Starting Backup")
    const res = await backend.housekeeping.backup()
    logger.warn("Backup result", res)
    return reply.status(200).send(res)
  })

  app.get("/api/audio/status", async (_req: any, reply: any) => {
    const serv = new PipewireTopService()
    const res = await serv.getStatus()
    return reply.status(200).send(res)
  })
}
