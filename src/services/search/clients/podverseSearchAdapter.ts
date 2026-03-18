// clients/podverse/search-adapter.ts
import { getLogger } from "../../../logger"
import { podverseClient } from "../../podverse/podverseClient"
import type { UnifiedSearchResult } from "../types"
import type { UnifiedSearchBackEnd } from "../types"
import type { BackendSearchClient } from "./types"

const logger = getLogger()

export const podverseSearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const res = await podverseClient.podcast.getPodcasts({ searchTitle: query, page: 1 })

      const results = res.map((ep: any) => ({
        id: ep.id,
        uri: ep.uri,
        backend: "podverse" as UnifiedSearchBackEnd,
        type: "podcast",
        title: ep.title,
        artist: ep.podcastTitle,
        duration: ep.duration,
        artworkUrl: ep.imageUrl,
        meta: {
          titleMatch: ep.title.toLowerCase().includes(query.toLowerCase()),
          podcastId: ep.podcastId,
        },
      }))

      if (limit && limit > 0) return results.slice(0, limit)

      return results
    } catch (err) {
      logger.error(`Error searching podverse`, err)
      return []
    }
  },
}
