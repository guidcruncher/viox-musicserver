// unified-search-engine.ts

import { getConfig } from "@/config"

import { getLogger } from "../../logger"
import { presetRepository } from "../../repositories/presetRepository"
import { tuneinRadioSearchAdapter } from "./clients"
import { podverseSearchAdapter } from "./clients/"
import { radioSearchAdapter } from "./clients/"
import { spotifySearchAdapter } from "./clients/"
import { localSearchAdapter } from "./clients/"
import { youtubeMusicSearchAdapter } from "./clients/"
import type { BackendSearchClient } from "./clients/types"
import { MemorySearchCache } from "./memorySearchCache"
import { normalizeQuery } from "./normalizeQuery"
import type { UnifiedSearchResult } from "./types"

class UnifiedSearchEngine {
  private readonly backends: Record<string, BackendSearchClient>
  private readonly limitPerBackend: number
  private readonly cache: MemorySearchCache
  private logger: any

  constructor(opts: {
    backends: Record<string, BackendSearchClient>
    limitPerBackend?: number
    cache?: MemorySearchCache
  }) {
    this.backends = opts.backends
    this.limitPerBackend = opts.limitPerBackend ?? 25
    this.cache = opts.cache ?? new MemorySearchCache()
    this.logger = getLogger()
  }

  async search(
    query: string,
    opts?: { page?: number; pageSize?: number; field?: string },
  ): Promise<{
    page: number
    pageSize: number
    total: number
    totalPages: number
    results: UnifiedSearchResult[]
  }> {
    const normalized = normalizeQuery(query)
    const page = opts?.page ?? 1
    const pageSize = opts?.pageSize ?? 25
    const field = (opts?.field ?? "").toLowerCase().trim()

    this.logger.debug(`Starting search for "${normalized}"`)

    // 1. Try cache
    const cached = await this.cache.get(normalized)
    let ranked: UnifiedSearchResult[]

    if (cached) {
      this.logger.debug(`Cache hit for "${normalized}"`)
      ranked = cached
    } else {
      this.logger.debug(`Cache miss for "${normalized}"`)

      // 2. Query all backends
      const promises = Object.entries(this.backends).map(async ([backendName, client]) => {
        try {
          this.logger.debug(`Searching backend ${backendName}`)
          const results = await client.search(normalized, this.limitPerBackend)
          this.logger.debug(`Found ${results?.length ?? 0} from backend ${backendName}`)
          return results
        } catch (err) {
          this.logger.error(`Search failed for backend ${backendName}`, err)
          return []
        }
      })

      const flat = (await Promise.all(promises)).flat()

      // 3. Rank + sort
      ranked = this.rankAndSort(flat)

      // 4. Cache full ranked list
      await this.cache.set(normalized, ranked)
    }

    const favoriteIds = await presetRepository.findAll()

    ranked.forEach((r: any) => {
      if (favoriteIds.find((f: any) => f.uri === r.uri)) {
        r.favourite = true
      } else {
        r.favourite = false
      }
    })

    // 5. Paging
    const total = ranked.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const end = start + pageSize

    if (field != "") {
      ranked = ranked.filter((t: any) => {
        if (t && t.id) {
          return t.id.includes(`${field}`)
        }
        return false
      })
    }

    return {
      page,
      pageSize,
      total,
      totalPages,
      results: ranked.slice(start, end),
    }
  }

  private rankAndSort(results: UnifiedSearchResult[]): UnifiedSearchResult[] {
    return results
      .map((r: any) => ({
        ...r,
        score: this.computeScore(r),
      }))
      .sort((a: any, b: any) => a.title.localeCompare(b.title))
    // .sort((a: any, b: any) => b.score - a.score)
  }

  private computeScore(r: UnifiedSearchResult): number {
    let score = 0

    if (r.meta?.titleMatch) score += 50

    const backendWeight: Record<string, number> = {
      spotify: 40,
      local: 30,
      podverse: 20,
      radio: 10,
    }
    score += backendWeight[r.backend] ?? 0

    if (typeof r.meta?.popularity === "number") {
      score += r.meta.popularity
    }

    return score
  }
}

export const unifiedSearchEngine = new UnifiedSearchEngine({
  backends: {
    podverse: podverseSearchAdapter,
    radio: radioSearchAdapter,
    tunein: tuneinRadioSearchAdapter,
    spotify: spotifySearchAdapter,
    local: localSearchAdapter,
    youtube: youtubeMusicSearchAdapter,
  },
  limitPerBackend: getConfig("searchLimit"),
  cache: new MemorySearchCache(getConfig("searchCacheSize")),
})
