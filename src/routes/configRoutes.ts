import type { FastifyInstance } from "fastify"

import { AppConfig, config } from "@/config"
import { readFileConfig, saveConfig } from "@/config/utils"
import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerConfigRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering config routes")

  app.get("/api/config/:key", async (req: any, reply: any) => {
    const { key } = req.params as any
    if (key in config) {
      return { value: (config as any)[key] }
    }

    return reply.status(404).send({ error: "Config key not found" })
  })

  app.put("/api/config/:key", async (req: any, reply: any) => {
    const { key } = req.params as any
    const { value } = req.body as any

    if (key in config) {
      const cfg = readFileConfig() || config
      cfg[key as keyof AppConfig] = value
      saveConfig(config)
      return reply.status(200).send({ message: "Config updated successfully" })
    }

    return reply.status(404).send({ error: "Config key not found" })
  })
}
