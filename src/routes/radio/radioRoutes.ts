import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { getConfig } from "@/config"

import { MediaItemSchema } from "../../schemas"
import { radioProvider } from "../../services/radio/radioProvider"

export async function radioRoutes(fastify: FastifyInstance) {
  const getClient = async () => {
    try {
      return await radioProvider(getConfig("radioProvider"))
      fastify.log.info("RadioBrowser: Server discovery successful")
    } catch (err: any) {
      fastify.log.error("RadioBrowser: Initial discovery failed", err)
      return undefined
    }
  }

  fastify.get(
    "/radio/provider",
    {
      schema: {
        tags: ["Radio"],
        description: "Gets the configured Radio provider",
        response: {
          200: { type: "string" },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.code(200).send({ provider: getConfig("radioProvider") })
    },
  )

  fastify.get(
    "/radio/countries",
    {
      schema: {
        description: "Get country list",
        tags: ["Radio"],
        response: {
          200: { type: "array" },
          500: {},
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const client = await getClient()
      if (!client) {
        return reply.code(500).send()
      }
      return await client.getCountries()
    },
  )

  // --- GET /search ---
  fastify.get(
    "/radio/search",
    {
      schema: {
        description: "Search for stations using filters",
        tags: ["Radio"],
        querystring: {
          type: "object",
          properties: {
            name: { type: "string" },
            countrycode: { type: "string" },
            limit: { type: "integer", default: 50 },
            offset: { type: "integer" },
          },
        },
        response: {
          500: {},
          200: { type: "array", items: MediaItemSchema },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const client = await getClient()
      if (!client) {
        return reply.code(500).send()
      }
      const { name, countrycode, limit, offset } = request.query as {
        name?: string
        countrycode?: string
        limit: number
        offset: number
      }

      return await client.search(name ?? "", { country: countrycode, offset: offset, limit: limit })
    },
  )

  // --- GET /station/:uuid ---
  fastify.get(
    "/radio/station/",
    {
      schema: {
        description: "Get a specific station by its UUID",
        tags: ["Radio"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: MediaItemSchema,
          404: { type: "object", properties: { error: { type: "string" } } },
          500: {},
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.query as { id: string }
      const client = await getClient()
      if (!client) {
        return reply.code(500).send()
      }
      try {
        return await client.getStation(id)
      } catch {
        reply.code(404).send({ error: "Station not found" })
      }
    },
  )
}
