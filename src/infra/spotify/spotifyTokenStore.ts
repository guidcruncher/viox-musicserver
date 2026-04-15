// src/services/spotify/spotifyTokenStore.ts
import { promises as fs } from "fs"
import path from "path"

import { getConfig } from "@/config"
import { logger } from "@/logger"

const CACHE_PATH = getConfig<string>("spotifyTokenPath")

export interface StoredSpotifyToken {
  accessToken: string
  refreshToken: string
  expiresAt: number // unix timestamp (ms)
  tokenType: string
  username: string
}

export const spotifyTokenStore = {
  async load(): Promise<StoredSpotifyToken | null> {
    try {
      logger.info(`Reading tolen from ${CACHE_PATH}`)
      const raw = await fs.readFile(CACHE_PATH, "utf8")
      return JSON.parse(raw)
    } catch (err) {
      logger.error(`Error Reading tolen from ${CACHE_PATH}`, err)
      return null
    }
  },

  async save(token: StoredSpotifyToken): Promise<void> {
    const json = JSON.stringify(token, null, 2)
    logger.info(`Saving tolen to ${CACHE_PATH}`)
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true })
    await fs.writeFile(CACHE_PATH, json, "utf8")
  },
}
