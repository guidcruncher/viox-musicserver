import type { FastifyInstance } from "fastify"
import { version as appversion } from "../../version"
import { readFileConfig, saveConfig } from "@/config"
import { ConfigFileSchema } from "@/schemas"
import type { VioxBackend } from "@/types"
import { getLogger } from "../../logger"

export function registerConfigRoutes(app: FastifyInstance, _backend: VioxBackend) {
  fastify.post(
    "/config",
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
    async (request, reply) => {
      const cfg = request.body as any
      const logger = getLogger()
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

  fastify.get(
    "/config",
    {
      schema: {
        tags: ["Config"],
        summary: "Retrieve the current config",
        response: {
          200: ConfigFileSchema,
        },
      },
    },
    async (req, reply) => {
      const cfg = readFileConfig()
      return reply.send(cfg)
    },
  )
}
