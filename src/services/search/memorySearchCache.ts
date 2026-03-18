import type { UnifiedSearchResult } from "./types"
import { SearchCache } from "./types"

export class MemorySearchCache implements SearchCache {
  private cache = new Map<string, UnifiedSearchResult[]>()

  constructor(private readonly maxSize = 200) {}

  async get(query: string): Promise<UnifiedSearchResult[] | undefined> {
    return this.cache.get(query)
  }

  async set(query: string, results: UnifiedSearchResult[]): Promise<void> {
    if (this.cache.has(query)) {
      this.cache.delete(query)
    } else if (this.cache.size >= this.maxSize) {
      const firstEntry = this.cache.entries().next().value
      if (firstEntry) {
        const [firstKey] = firstEntry
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(query, results)
  }
}
