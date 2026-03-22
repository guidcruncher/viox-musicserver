import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerRadioRoutes(app: FastifyInstance, _backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering version routes")

  app.get("/api/radio", async (_req: any, reply: any) => {
    reply.send({
      tunein: "TuneIn",
      radiobrowser: "Radio Browser",
    })
  })
}
