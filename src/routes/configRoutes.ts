import type { FastifyInstance } from "fastify"

import { readFileConfig, saveConfig } from "@/config"
import { getLogger } from "@/logger"
import { ConfigFileSchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerConfigRoutes(app: FastifyInstance, _backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering Config routes")

  app.post(
    "/api/config",
    {
      schema: {
        tags: ["Config"],
        summary: "Update the configuration",
        body: {
          type: "object",
          required: ["config"],
          properties: {
            config: ConfigFileSchema,
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const cfg = request.body as any
      if (!cfg || !cfg.config) {
        logger.error("No configuration passed for saving")
        return reply.code(400).send({ ok: false })
      }

      if (saveConfig(cfg.config)) {
        return reply.send({ ok: true })
      }

      return reply.send({ ok: false })
    },
  )

  app.get(
    "/api/config",
    {
      schema: {
        tags: ["Config"],
        summary: "Retrieve the current config",
        response: {
          200: ConfigFileSchema,
        },
      },
    },
    async (req: any, reply: any) => {
      const cfg = readFileConfig()
      return reply.send(cfg)
    },
  )
}
