import { FastifyInstance } from "fastify"

import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function artistsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/spotify/artists/:id",
    {
      schema: {
        tags: ["Spotify"],
        description: "Get a single Spotify artist by ID.",
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Spotify Artist ID" },
          },
          required: ["id"],
        },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string }
      return spotifyWebApi.artists.getArtist(id)
    },
  )

  fastify.get(
    "/spotify/artists/",
    {
      schema: {
        tags: ["Spotify"],
        description: "Get multiple Spotify artists by comma-separated IDs.",
        querystring: {
          type: "object",
          properties: {
            ids: {
              type: "string",
              description: "Comma-separated list of Spotify Artist IDs",
            },
          },
          required: ["ids"],
        },
      },
    },
    async (req) => {
      const { ids } = req.query as { ids: string }
      return spotifyWebApi.artists.getArtists(ids.split(","))
    },
  )

  fastify.get(
    "/spotify/artists/:id/albums",
    {
      schema: {
        tags: ["Spotify"],
        description: "Get albums released by a Spotify artist.",
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Spotify Artist ID" },
          },
          required: ["id"],
        },
        querystring: {
          type: "object",
          properties: {
            include_groups: {
              type: "string",
              description: "Filter by album group types (e.g., album,single,appears_on)",
            },
            market: {
              type: "string",
              description: "ISO market code (e.g., US, GB)",
            },
            limit: {
              type: "number",
              description: "Max number of items to return",
            },
            offset: {
              type: "number",
              description: "Index of first item to return",
            },
          },
        },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string }
      const opts = req.query as {
        include_groups?: string
        market?: string
        limit?: number
        offset?: number
      }
      return spotifyWebApi.artists.getArtistAlbums(id, opts)
    },
  )

  fastify.get(
    "/spotify/artists/:id/top-tracks",
    {
      schema: {
        tags: ["Spotify"],
        description: "Get an artist's top tracks for a specific market.",
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Spotify Artist ID" },
          },
          required: ["id"],
        },
        querystring: {
          type: "object",
          properties: {
            market: {
              type: "string",
              description: "ISO market code (required by Spotify)",
            },
          },
          required: ["market"],
        },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string }
      const { market } = req.query as { market: string }
      return spotifyWebApi.artists.getArtistTopTracks(id, market)
    },
  )

  fastify.get(
    "/spotify/artists/:id/related-artists",
    {
      schema: {
        tags: ["Spotify"],
        description: "Get artists related to a given Spotify artist.",
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "Spotify Artist ID" },
          },
          required: ["id"],
        },
      },
    },
    async (req) => {
      const { id } = req.params as { id: string }
      return spotifyWebApi.artists.getRelatedArtists(id)
    },
  )
}
