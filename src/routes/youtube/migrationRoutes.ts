import { FastifyInstance } from "fastify"

import { getLogger } from "../../logger"
import { migrationWriter } from "../../services/youtube/migrationWriter"
import type { MediaItem } from "../../types/media-types"

export async function migrationRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/migration/save",
    {
      schema: {
        tags: ["Migration"],
        summary: "Saves the JSON output from a migration to the database",
        body: {
          type: "array",
          items: { type: "object" },
        },
        response: {
          200: {
            type: "object",
            properties: {
              count: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const items = request.body as any[]
      const count = migrationWriter.save(items)
      return reply.send({ ok: true, input: items.length, written: count })
    },
  )

  fastify.post(
    "/migration/start",
    {
      schema: {
        tags: ["Migration"],
        summary: "Start a YouTube migration task",
        response: {
          202: {
            type: "object",
            properties: {
              id: { type: "string" },
              state: { type: "string" },
              startedAt: { type: "number" },
              finishedAt: { type: "number", nullable: true },
              error: { type: "string", nullable: true },
              results: { type: "array", nullable: true },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as { items?: MediaItem[] }
      const items = body?.items ?? []
      const logger = getLogger()

      logger.debug("Migration stsrt route")
      // NEW: runtime undefined / invalid check
      if (!body?.items || !Array.isArray(items) || items.length === 0) {
        logger.warn("No items passed to migration start, will fetch your current library")
      }

      try {
        logger.debug("Starting migration")
        const status = await fastify.migrationService.startMigration(items)
        return reply.code(202).send(status)
      } catch (err: any) {
        logger.error(`Error starting migration ${JSON.stringify(err)}`)
        return reply.code(400).send({ error: err.message })
      }
    },
  )

  fastify.get(
    "/migration/status",
    {
      schema: {
        tags: ["Migration"],
        summary: "Get current migration status",
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string", nullable: true },
              state: { type: "string" },
              count: { type: "number", nullable: true },
              success: { type: "number", nullable: true },
              fail: { type: "number", nullable: true },
              startedAt: { type: "number", nullable: true },
              finishedAt: { type: "number", nullable: true },
              error: { type: "string", nullable: true },
              results: { type: "array", nullable: true },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const status = fastify.migrationService.getStatus()
      return reply.send(status ?? { state: "idle" })
    },
  )

  fastify.get(
    "/migration/status/:id",
    {
      schema: {
        tags: ["Migration"],
        summary: "Get migration status by ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              state: { type: "string" },
              count: { type: "number", nullable: true },
              success: { type: "number", nullable: true },
              fail: { type: "number", nullable: true },
              startedAt: { type: "number", nullable: true },
              finishedAt: { type: "number", nullable: true },
              error: { type: "string", nullable: true },
              results: { type: "array", nullable: true },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const logger = getLogger()
      const { id } = req.params as { id: string }
      const status = fastify.migrationService.getStatusById(id)

      if (!status) {
        logger.error(`Error querying status, not found - id  ${id}`)
        return reply.code(404).send({ error: "Migration not found" })
      }

      return reply.send(status)
    },
  )
}
