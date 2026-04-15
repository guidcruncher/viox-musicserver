import * as path from "path"

import { logger } from "@/logger"

import type { AppConfig, ConfigFile } from "./types"
import { readFileConfig, readSecret } from "./utils"

export const API_DEFAULT_PAGESIZE = 20

// ─── Env-var mapping ────────────────────────────────────────────────────────
// Maps each AppConfig key to its corresponding environment variable name.
// Keys not listed here are derived or come from Docker secrets / file only.
const ENV_MAP: Partial<Record<keyof AppConfig, string>> = {
  nodeEnv: "NODE_ENV",
  baseUrl: "BASE_URL",
  cacheFolder: "CACHE_FOLDER",
  musicFolder: "MUSIC_FOLDER",
  irResponseBase: "IR_RESPONSE_BASE",
  redisUrl: "REDIS_URL",
  radioProvider: "RADIO_PROVIDER",
  searchLimit: "SEARCH_BACKEND_LIMIT",
  searchCacheSize: "SEARCH_CACHE_SIZE",
  enableSpotifyCache: "ENABLE_SPOTIFY_CACHE",
  spotifyDeviceName: "SPOTIFY_DEVICE_NAME",
  spotifyRefreshToken: "SPOTIFY_REFRESH_TOKEN",
  visualization: "VISUALIZATION",
  downloadPodcasts: "DOWNLOAD_PODCASTS",
}

// ─── Defaults ───────────────────────────────────────────────────────────────
const DEFAULTS: AppConfig = {
  nodeEnv: "development",
  baseUrl: "",
  callbackUrl: "",
  spotifyRedirectUrl: "",
  database: "/data/datastore.db",
  cacheFolder: "/data/cache",
  musicFolder: "/music",
  spotifyTokenPath: path.join("/data/auth", "spotify-token.json"),
  youtubeCreds: path.resolve("/data/", "youtube-oauth-creds.json"),
  irResponseBase: "/app/ir-files",
  spotifyClientId: undefined,
  spotifyClientSecret: undefined,
  spotifyRefreshToken: null,
  spotifyDeviceName: "VIOX",
  enableSpotifyCache: false,
  searchLimit: 50,
  searchCacheSize: 2000,
  radioProvider: "radiobrowser",
  redisUrl: "",
  visualization: "bar",
  downloadPodcasts: false,
}

// ─── Internal: file-config cache (2 s TTL) ─────────────────────────────────
let cachedFileData: ConfigFile | undefined = undefined
let lastReadTime = 0
const CACHE_TTL_MS = 2000

const getFileData = (): ConfigFile | undefined => {
  const now = Date.now()
  if (!cachedFileData || now - lastReadTime > CACHE_TTL_MS) {
    cachedFileData = readFileConfig()
    lastReadTime = now
  }
  return cachedFileData
}

// ─── Type-coercion helper ───────────────────────────────────────────────────
const coerceEnvValue = (raw: string, defaultValue: unknown): unknown => {
  if (typeof defaultValue === "number") return Number(raw)
  if (typeof defaultValue === "boolean") return raw.toLowerCase() === "true"
  return raw
}

// ─── Build the resolved config ──────────────────────────────────────────────
/**
 * Assemble the full AppConfig by layering sources in order:
 *   1. Defaults
 *   2. Environment variables  (coerced to match the default's type)
 *   3. Docker secrets         (spotifyClientId, spotifyClientSecret)
 *   4. Config-file override   (JSON file, cached for 2 s)
 *
 * Derived values (callbackUrl, spotifyRedirectUrl) are recomputed after
 * every layer so they always reflect the final baseUrl.
 */
const buildConfig = (): AppConfig => {
  // 1 ─ Start with defaults
  const cfg: AppConfig = { ...DEFAULTS }

  // 2 ─ Layer environment variables
  for (const [key, envVar] of Object.entries(ENV_MAP)) {
    const raw = process.env[envVar]
    if (raw !== undefined) {
      const k = key as keyof AppConfig
      ;(cfg as unknown as Record<string, unknown>)[k] = coerceEnvValue(raw, DEFAULTS[k])
    }
  }

  // 3 ─ Docker secrets
  cfg.spotifyClientId = readSecret("spotify-clientid") ?? cfg.spotifyClientId
  cfg.spotifyClientSecret = readSecret("spotify-clientsecret") ?? cfg.spotifyClientSecret

  // 4 ─ Config-file override (highest priority)
  try {
    const fileOverrides = getFileData()
    if (fileOverrides) {
      for (const [key, value] of Object.entries(fileOverrides)) {
        if (value !== undefined) {
          ;(cfg as unknown as Record<string, unknown>)[key] = value
        }
      }
    }
  } catch (err) {
    logger.warn("Failed to read config file override", err)
  }

  // 5 ─ Derived values (always recomputed from final baseUrl)
  cfg.callbackUrl = `${cfg.baseUrl}/callback`
  cfg.spotifyRedirectUrl = `${cfg.baseUrl}/api/spotify/auth/callback`

  return cfg
}

/**
 * The resolved, typed application configuration.
 *
 * Accessing `config.radioProvider` gives you the final merged value
 * from defaults → env → secrets → file-override.
 *
 * The object is rebuilt on every property access when the file-cache
 * TTL has expired, so runtime file changes are picked up automatically.
 */
export const config: AppConfig = new Proxy({} as AppConfig, {
  get(_target, prop: string) {
    const resolved = buildConfig()
    return resolved[prop as keyof AppConfig]
  },
})

/**
 * Legacy getter kept for backward compatibility.
 * Prefer direct property access via `config.someKey`.
 */
export const getConfig = <T>(key: string): T => {
  return config[key as keyof AppConfig] as T
}
