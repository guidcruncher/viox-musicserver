// src/infra/search/searchService.ts
import type { MediaItem } from "@/types"
import type { PlaybackBackend } from "@/types"

export interface SearchBackend {
  search?(query: string): Promise<MediaItem[]>
}

export class SearchService {
  private readonly backends: Record<string, SearchBackend>

  constructor(backends: Record<string, SearchBackend>) {
    this.backends = backends
  }

  async search(query: string): Promise<MediaItem[]> {
    const results: MediaItem[] = []

    const tasks = Object.values(this.backends).map(async (backend) => {
      if (!backend.search) return
      try {
        const items = await backend.search(query)
        if (items && items.length > 0) {
          results.push(...items)
        }
      } catch {
        // ignore backend search errors
      }
    })

    await Promise.all(tasks)

    return results
  }
}
