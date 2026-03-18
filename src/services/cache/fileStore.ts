// src/services/cache/FileStore.ts
import { promises as fs } from "fs"
import * as fsSync from "fs"
import path from "path"

import { getConfig } from "@/config"

import { getLogger } from "../../logger"
import { CacheStore } from "./types"

const CACHE_DIR = `${getConfig("cacheFolder")}/cache-l2`

export class FileStore implements CacheStore {
  private logger

  constructor() {
    this.logger = getLogger()
    fsSync.mkdirSync(CACHE_DIR, { recursive: true })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const file = path.join(CACHE_DIR, `${key}.json`)
      const raw = await fs.readFile(file, "utf8")
      const parsed = JSON.parse(raw)
      if (Date.now() > parsed.cachedAt + parsed.ttl) return null
      return parsed.data
    } catch {
      return null
    }
  }

  async set<T>(key: string, data: T, ttlMs = 3600000): Promise<void> {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const payload = { cachedAt: Date.now(), ttl: ttlMs, data }
    await fs.writeFile(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(payload, null, 2))
  }

  async del(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(CACHE_DIR, `${key}.json`))
    } catch (e) {
      this.logger.error(`Error deleting ${key}`, e)
    }
  }

  async flush(): Promise<void> {
    try {
      // Remove the directory and recreate it to effectively "flush" all files
      await fs.rm(CACHE_DIR, { recursive: true, force: true })
      await fs.mkdir(CACHE_DIR, { recursive: true })
    } catch (e) {
      this.logger.error(`Error flushing cache`, e)
    }
  }
}
