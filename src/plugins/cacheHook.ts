// src/plugins/cacheHook.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { getConfig } from "@/config"

import { MultiLevelCache } from "../services/cache/multiLevelCache"

/**
 * Configuration for specific API paths
 */
interface PathConfig {
  prefix: string // The URL prefix to match (e.g., "/spotify/tracks")
  isPaginated?: boolean // Whether to look for and apply offset/limit slicing
  ttlMs?: number // Optional override for cache duration
  alwaysOn?: boolean
}

interface CacheHookOptions {
  cacheService: MultiLevelCache
  routes: PathConfig[]
}

export default async function cachePlugin(app: FastifyInstance, options: CacheHookOptions) {
  const { cacheService, routes } = options

  /**
   * Helper: Matches the current request URL against the configured route prefixes.
   */
  const getRouteConfig = (url: string): PathConfig | undefined => {
    const res = routes.find((r) => url.toLowerCase().startsWith(r.prefix.toLowerCase()))
    if (!res) return undefined
    if (!res.alwaysOn) {
      if (getConfig("enableCache")) return res
      return undefined
    }
    return res
  }

  /**
   * PRE-HANDLER: Check if the request is cached before reaching the route logic.
   */
  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    const url = req.raw.url || ""

    const routeConfig = getRouteConfig(url)

    // Skip if the path isn't in our whitelist
    if (!routeConfig) return

    // Generate a consistent key based on the path, ignoring query parameters
    const urlPath = url.split("?")[0]
    const key = urlPath.replace(/\W+/g, "_")

    // Logic for Paginated Routes
    if (routeConfig.isPaginated) {
      const query = req.query as any
      const offset = parseInt(query.offset)
      const limit = parseInt(query.limit)

      // Only attempt paginated retrieval if both params are present
      if (!isNaN(offset) && !isNaN(limit)) {
        const paginated = await cacheService.getPaginated<any>(key, offset, limit)
        if (paginated) {
          reply.header("x-cache", "HIT-PAGINATED")
          return reply.send(paginated)
        }
      }
    }

    // Standard L1/L2 Lookup
    const cached = await cacheService.get<any>(key)
    if (cached) {
      reply.header("x-cache", "HIT") // Hits could come from Redis or FS
      return reply.send(cached)
    }
  })

  /**
   * ON-SEND: Intercept the successful response and save it to the cache layers.
   */
  app.addHook("onSend", async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
    const url = req.raw.url || ""
    const routeConfig = getRouteConfig(url)

    // Only cache if the route is configured and the response is successful JSON
    const contentType = reply.getHeader("content-type")
    if (!routeConfig || !contentType?.toString().includes("application/json")) {
      return payload
    }

    try {
      const query = req.query as any

      // DO NOT cache if this is a paginated request.
      // We only store the "Full Result Set" as the source of truth to slice later.
      if (routeConfig.isPaginated && (query.offset !== undefined || query.limit !== undefined)) {
        return payload
      }

      const data = JSON.parse(payload.toString())
      const urlPath = url.split("?")[0]
      const key = urlPath.replace(/\W+/g, "_")

      // Save to L1 (Redis) and L2 (Filesystem) simultaneously
      await cacheService.set(key, data, routeConfig.ttlMs)

      reply.header("x-cache", "MISS")
      return JSON.stringify(data)
    } catch {
      // If parsing fails or storage errors, just return the original payload
      return payload
    }
  })
}
