// src/services/cache/MultiLevelCache.ts
import { FileStore } from "./fileStore"
import { RedisStore } from "./redisStore"
import { CacheStore } from "./types"

export class MultiLevelCache {
  private l1: CacheStore = new RedisStore()
  private l2: CacheStore = new FileStore()

  /**
   * Orchestrated Get: L1 -> L2 (with hydration)
   */
  async get<T>(key: string): Promise<T | null> {
    const l1Hit = await this.l1.get<T>(key)
    if (l1Hit) return l1Hit

    const l2Hit = await this.l2.get<T>(key)
    if (l2Hit) {
      await this.l1.set(key, l2Hit)
      return l2Hit
    }
    return null
  }

  /**
   * Orchestrated Set: Writes to both layers
   */
  async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
    await Promise.all([this.l1.set(key, data, ttlMs), this.l2.set(key, data, ttlMs)])
  }

  /**
   * Orchestrated Delete: Removes from both layers
   * Essential for cache invalidation.
   */
  async del(key: string): Promise<void> {
    await Promise.all([this.l1.del(key), this.l2.del(key)])
  }

  /**
   * Orchestrated Flush: Clears everything in L1 and L2
   */
  async flush(): Promise<void> {
    await Promise.all([this.l1.flush(), this.l2.flush()])
  }

  /**
   * Paginated helper for cached arrays
   */
  async getPaginated<T>(key: string, offset: number, limit: number) {
    const fullSet = await this.get<T[]>(key)
    if (!fullSet || !Array.isArray(fullSet)) return null

    return {
      data: fullSet.slice(offset, offset + limit),
      total: fullSet.length,
      offset,
      limit,
    }
  }
}
