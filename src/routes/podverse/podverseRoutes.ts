import { FastifyInstance, FastifyRequest } from "fastify"

import { PodverseClient } from "../../services/podverse/podverseClient"
import { InvokeIndexer } from "../../services/podverse/podverseIndexerDaemon"

// ─────────────────────────────────────────────
// JSON SCHEMAS (no TypeBox)
// ─────────────────────────────────────────────

const AuthorSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string", nullable: true },
    url: { type: "string", nullable: true },
    podcastId: { type: "string", nullable: true },
  },
  required: ["id"],
}

const CategorySchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    slug: { type: "string", nullable: true },
    title: { type: "string", nullable: true },
  },
  required: ["id"],
}

const PodcastSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    imageUrl: { type: "string", nullable: true },
    linkUrl: { type: "string", nullable: true },
    language: { type: "string", nullable: true },
    isExplicit: { type: "boolean", nullable: true },
    isPublic: { type: "boolean", nullable: true },
    lastEpisodePubDate: { type: "string", nullable: true },
    authors: { type: "array", items: AuthorSchema, nullable: true },
  },
  required: ["id"],
}

const EpisodeSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string", nullable: true },
    description: { type: "string", nullable: true },
    imageUrl: { type: "string", nullable: true },
    linkUrl: { type: "string", nullable: true },
    mediaUrl: { type: "string" },
    pubDate: { type: "string", nullable: true },
    duration: { type: "number", nullable: true },
    podcast: { ...PodcastSchema, nullable: true },
  },
  required: ["id", "mediaUrl"],
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

export async function podverseRoutes(fastify: FastifyInstance) {
  const client = new PodverseClient()

  fastify.get(
    "/podverse/indexer",
    {
      schema: {
        description: "Invoke Indexer",
        tags: ["Podverse"],
      },
    },
    async () => {
      await InvokeIndexer()
      return true
    },
  )

  // --- GET /podverse/podcasts ---
  fastify.get(
    "/podverse/podcasts",
    {
      schema: {
        description: "Fetch podcasts from Podverse",
        tags: ["Podverse"],
        querystring: {
          type: "object",
          properties: {
            search: { type: "string" },
            page: { type: "number" },
          },
        },
        response: {
          200: {
            type: "array",
            items: PodcastSchema,
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { search, page } = req.query as {
        search?: string
        page?: number
      }

      return client.podcast.getPodcasts({
        searchTitle: search,
        page,
      })
    },
  )

  // --- GET /podverse/podcasts/:category ---
  fastify.get(
    "/podverse/podcasts/:category",
    {
      schema: {
        description: "Fetch podcasts from Podverse by category",
        tags: ["Podverse"],
        querystring: {
          type: "object",
          properties: {
            page: { type: "number" },
          },
        },
        params: {
          type: "object",
          properties: {
            category: { type: "string" },
          },
          required: ["category"],
        },
        response: {
          200: {
            type: "array",
            items: PodcastSchema,
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { category } = req.params as { category: string }
      const { page } = req.query as {
        page?: number
      }
      return client.podcast.getPodcasts({
        categories: category,
        page,
      })
    },
  )

  // --- GET /podverse/podcast/:id ---
  fastify.get(
    "/podverse/podcast/:id",
    {
      schema: {
        description: "Fetch a single podcast by ID",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: PodcastSchema,
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      return client.podcast.getPodcastById(id)
    },
  )

  // --- GET /podverse/episodes ---
  fastify.get(
    "/podverse/episodes",
    {
      schema: {
        description: "Fetch episodes from Podverse",
        tags: ["Podverse"],
        querystring: {
          type: "object",
          properties: {
            podcastId: { type: "string" },
            search: { type: "string" },
            page: { type: "number" },
          },
        },
        response: {
          200: {
            type: "array",
            items: EpisodeSchema,
          },
        },
      },
    },
    async (req: FastifyRequest) => {
      const { podcastId, search, page } = req.query as {
        podcastId: string
        search?: string
        page?: number
      }

      fastify.log.debug(
        `Fetching episodes for podcastId ${podcastId} with search "${search}" and page ${page}`,
      )
      return client.episode.getEpisodes({
        podcastId,
        searchTitle: search,
        page,
        includePodcast: true,
      })
    },
  )

  // --- GET /podverse/episodes/:id ---
  fastify.get(
    "/podverse/episode/:id",
    {
      schema: {
        description: "Fetch a single episode by ID",
        tags: ["Podverse"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: EpisodeSchema,
        },
      },
    },
    async (req: FastifyRequest) => {
      const { id } = req.params as { id: string }
      return client.episode.getEpisodeById(id)
    },
  )

  // --- GET /podverse/categories ---
  fastify.get(
    "/podverse/categories",
    {
      schema: {
        description: "Fetch podcast categories",
        tags: ["Podverse"],
        response: {
          200: {
            type: "array",
            items: CategorySchema,
          },
        },
      },
    },
    async () => {
      return await client.category.getCategories()
    },
  )
}
