import * as path from "path"

import { getLogger } from "../logger"
import type { ConfigFile } from "./types"
import { readFileConfig, readSecret } from "./utils"

export const API_DEFAULT_PAGESIZE = 20

/**
 * 1. Configuration Metadata Registry
 */
const CONFIG_REGISTRY: Record<string, [string, any]> = {
  radioProvider: ["RADIO_PROVIDER", "radiobrowser"],
  searchLimit: ["SEARCH_BACKEND_LIMIT", 50],
  searchCacheSize: ["SEARCH_CACHE_SIZE", 2000],
  musicCache: ["MUSIC_CACHE", "/data/musiccache"],
  podcastCache: ["PODCAST_CACHE", "/data/podcastcache"],
  nodeEnv: ["NODE_ENV", "development"],
  cacheFolder: ["CACHE_FOLDER", "/cache"],
  musicFolder: ["MUSIC_FOLDER", "/music"],
  redisUrl: ["REDIS_URL", ""],
  enableSpotifyCache: ["ENABLE_SPOTIFY_CACHE", false],
  spotifyDeviceName: ["SPOTIFY_DEVICE_NAME", "VIOX"],
  visualization: ["VISUALIZATION", "bar"],
}

const FILE_EXCLUSIONS = new Set(["cacheFolder", "musicFolder", "redisUrl", "nodeEnv"])

// Internal state for the 2-second cache
let cachedFileData: ConfigFile | undefined = undefined
let lastReadTime = 0
const CACHE_TTL_MS = 2000

/**
 * Internal helper to get fresh or cached file data
 */
const getFileData = (): ConfigFile | undefined => {
  const now = Date.now()
  if (!cachedFileData || now - lastReadTime > CACHE_TTL_MS) {
    cachedFileData = readFileConfig()
    lastReadTime = now
  }
  return cachedFileData
}

const getFileConfig = <K extends keyof ConfigFile>(key: K): ConfigFile[K] | undefined => {
  // C. File System (with 2s Cache)
  const fileConfig = getFileData()
  if (fileConfig) {
    if (!FILE_EXCLUSIONS.has(key)) {
      return fileConfig[key]
    }
  }

  return undefined
}

/**
 * GLOBAL GETTER
 * Usage: const val = getConfig<string>("radioProvider")
 */
export const getConfig = <T>(key: string): T => {
  const logger = getLogger()

  // A. Derived / Hardcoded Logic
  if (key === "database") return "/data/datastore.db" as any
  if (key === "youtubeCreds") return path.resolve("/data/", "youtube-oauth-creds.json") as any
  if (key === "spotifyTokenPath") {
    return path.join(getConfig<string>("cacheFolder"), "spotify-token.json") as any
  }
  if (key === "spotifyClientId") return readSecret("spotify-clientid") as any
  if (key === "spotifyClientSecret") return readSecret("spotify-clientsecret") as any
  if (key === "baseUrl") return `${process.env.BASE_URL}` as any
  if (key === "callbackUrl") return `${process.env.BASE_URL}/callback` as any
  if (key === "spotifyRedirectUrl")
    return `${process.env.BASE_URL}/api/spotify/auth/callback` as any

  // B. Registry Lookup
  const metadata = CONFIG_REGISTRY[key]
  if (!metadata) {
    logger.warn(`Config key "${key}" missing from registry.`)
    return undefined as any
  }
  const [envVar, defaultValue] = metadata

  try {
    // C. File System (with 2s Cache)
    const fileValue = getFileConfig(key as keyof ConfigFile)
    if (fileValue) return fileValue as T
  } catch (err) {
    logger.trace(`Config key "${key}" not in config file.`, err)
  }
  // D. Environment Variables
  const envVal = process.env[envVar]
  if (envVal !== undefined) {
    if (typeof defaultValue === "number") return Number(envVal) as T
    if (typeof defaultValue === "boolean") return (envVal.toLowerCase() === "true") as T
    return envVal as T
  }

  return defaultValue as T
}
