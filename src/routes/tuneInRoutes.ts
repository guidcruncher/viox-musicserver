import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerTuneInRoutes(app: FastifyInstance, backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering version routes")

  app.get("/api/tunein/browse/:guideId", async (_req: any, reply: any) => {
backend.backends

  })
}
