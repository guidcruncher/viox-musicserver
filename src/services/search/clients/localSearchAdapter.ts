// clients/podverse/search-adapter.ts
import { getLogger } from "../../../logger"
import { LocalFileSearch } from "../../medialibrary/localFileSearch"
import type { UnifiedSearchResult } from "../types"
import type { BackendSearchClient } from "./types"

const logger = getLogger()

export const localSearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const local = new LocalFileSearch()
      await local.buildIndex()
      return local.search(query, limit)
    } catch (err) {
      logger.error(`Error searching local`, err)
      return []
    }
  },
}
