// types.ts
export type UnifiedSearchBackEnd = "podverse" | "radio" | "spotify" | "local" | "youtube"

export interface UnifiedSearchResult {
  id: string
  backend: UnifiedSearchBackEnd
  title: string
  artist?: string
  album?: string
  duration?: number
  artworkUrl?: string
  type: string
  format?: string
  uri: string
  meta?: Record<string, unknown>
  score?: number
  favourite?: boolean
}

export interface SearchCache {
  get(query: string): Promise<UnifiedSearchResult[] | undefined>
  set(query: string, results: UnifiedSearchResult[]): Promise<void>
}
