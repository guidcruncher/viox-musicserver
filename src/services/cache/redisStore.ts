// src/services/cache/RedisStore.ts
import Redis from "ioredis"

import { getConfig } from "@/config"

import { CacheStore } from "./types"

export class RedisStore implements CacheStore {
  private redis: Redis | null = null

  constructor() {
    if (getConfig("redisUrl") != "") {
      this.redis = new Redis(getConfig("redisUrl"))
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    const raw = await this.redis.get(key)
    return raw ? JSON.parse(raw) : null
  }

  async set<T>(key: string, data: T, ttlMs = 1800000): Promise<void> {
    if (!this.redis) return
    await this.redis.set(key, JSON.stringify(data), "PX", ttlMs)
  }

  async del(key: string): Promise<void> {
    if (this.redis) await this.redis.del(key)
  }

  async flush(): Promise<void> {
    if (this.redis) await this.redis.flushdb()
  }
}
