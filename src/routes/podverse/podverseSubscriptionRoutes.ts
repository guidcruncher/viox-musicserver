import { FastifyInstance, FastifyRequest } from "fastify"

import { PodverseClient } from "../../services/podverse/podverseClient"

export async function podverseSubscriptionRoutes(fastify: FastifyInstance) {
  // --- POST /podverse/podcast/:id/subscribe ---
  fastify.post(
    "/podverse/podcast/:id/subscribe",
    {
      schema: {
        description: "Subscribe to a podcast (local store)",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              podcastId: { type: "string" },
              subscribed: { type: "boolean" },
            },
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      await client.subscriptions.subscribe(id)

      return { podcastId: id, subscribed: true }
    },
  )

  // --- POST /podverse/podcast/:id/unsubscribe ---
  fastify.post(
    "/podverse/podcast/:id/unsubscribe",
    {
      schema: {
        description: "Unsubscribe from a podcast (local store)",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              podcastId: { type: "string" },
              subscribed: { type: "boolean" },
            },
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      await client.subscriptions.unsubscribe(id)

      return { podcastId: id, subscribed: false }
    },
  )

  // --- POST /podverse/podcast/:id/toggle ---
  fastify.post(
    "/podverse/podcast/:id/toggle",
    {
      schema: {
        description: "Toggle subscription state for a podcast",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              podcastId: { type: "string" },
              subscribed: { type: "boolean" },
            },
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      await client.subscriptions.toggle(id)
      const subscribed = await client.subscriptions.isSubscribed(id)

      return { podcastId: id, subscribed }
    },
  )

  // --- POST /podverse/podcast/episode/:id/listened ---
  fastify.post(
    "/podverse/podcast/episode/:id/listened",
    {
      schema: {
        description: "Set episode as listened",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      await client.subscriptions.setListened(id, true)
      return { episodeId: id, listened: true }
    },
  )

  // --- GET /podverse/subscriptions ---
  fastify.get(
    "/podverse/subscriptions",
    {
      schema: {
        description: "List all subscribed podcast IDs",
        tags: ["Podverse"],
      },
    },
    async () => {
      const client = new PodverseClient()
      return client.subscriptions.getSubscriptions()
    },
  )

  // --- GET /podverse/subscriptions ---
  fastify.get(
    "/podverse/subscriptions/details",
    {
      schema: {
        description: "List all subscribed podcast details",
        tags: ["Podverse"],
      },
    },
    async () => {
      const client = new PodverseClient()
      return client.subscriptions.getSubscriptionDetails()
    },
  )

  // --- GET /podverse/subscriptio/:id/episodes ---
  fastify.get(
    "/podverse/subscription/:id/episodes",
    {
      schema: {
        description: "List all episodes for a subscribed podcast",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      return await client.subscriptions.getEpisodes(id)
    },
  )

  // --- GET /podverse/subscription/:id ---
  fastify.get(
    "/podverse/subscription/:id",
    {
      schema: {
        description: "Check if a podcast is subscribed",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              podcastId: { type: "string" },
              subscribed: { type: "boolean" },
            },
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      const client = new PodverseClient()
      const subscribed = await client.subscriptions.isSubscribed(id)

      return { podcastId: id, subscribed }
    },
  )
}
