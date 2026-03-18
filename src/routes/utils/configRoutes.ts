import { FastifyInstance } from "fastify"

import { readFileConfig, saveConfig } from "@/config"
import { ConfigFileSchema } from "@/schemas"

import { getLogger } from "../../logger"

export async function configRoutes(fastify: FastifyInstance) {
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
