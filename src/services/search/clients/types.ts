// clients/types.ts
import { UnifiedSearchResult } from "../types"

export interface BackendSearchClient {
  search(query: string, limit: number): Promise<UnifiedSearchResult[]>
}
