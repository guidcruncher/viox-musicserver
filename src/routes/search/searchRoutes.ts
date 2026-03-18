import type { FastifyInstance } from "fastify"

import { UnifiedSearchResultSchema } from "@/schemas"

import { unifiedSearchEngine } from "../../services/search/unifiedSearchEngine"

export async function searchRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/search",
    {
      schema: {
        tags: ["Search"],
        summary: "Unified content search",
        querystring: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string" },
            page: { type: "number", minimum: 1 },
            pageSize: { type: "number", minimum: 1, maximum: 200 },
            field: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["page", "pageSize", "total", "totalPages", "results"],
            properties: {
              page: { type: "number" },
              pageSize: { type: "number" },
              total: { type: "number" },
              totalPages: { type: "number" },
              results: {
                type: "array",
                items: UnifiedSearchResultSchema,
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { q, page, pageSize, field } = req.query as {
        q: string
        page?: number
        pageSize?: number
        field?: string
      }

      const result = await unifiedSearchEngine.search(q, {
        page,
        pageSize,
        field,
      })

      return reply.send(result)
    },
  )
}
