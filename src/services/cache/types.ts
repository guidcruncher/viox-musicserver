// src/services/cache/types.ts
export interface CacheStore {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, data: T, ttlMs?: number): Promise<void>
  del(key: string): Promise<void>
  flush(): Promise<void> // Clear all data in this store
}
