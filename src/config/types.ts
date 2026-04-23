/**
 * Full application configuration.
 *
 * Resolution order (last wins):
 *   1. Defaults (hardcoded below)
 *   2. Environment variables
 *   3. Docker secrets (spotifyClientId, spotifyClientSecret)
 *   4. Config-file override  (/config/viox-musicserver-config.json)
 */
export interface AppConfig {
  // ── Runtime ────────────────────────────────────────
  nodeEnv: string

  // ── Networking / URLs ──────────────────────────────
  baseUrl: string
  callbackUrl: string
  spotifyRedirectUrl: string

  // ── Paths ──────────────────────────────────────────
  database: string
  cacheFolder: string
  musicFolder: string
  spotifyTokenPath: string
  irResponseBase: string

  // ── Spotify ────────────────────────────────────────
  spotifyClientId: string | undefined
  spotifyClientSecret: string | undefined
  spotifyRefreshToken: string | null
  spotifyDeviceName: string

  // ── Podcasts ───────────────────────────────────────
  downloadPodcasts: boolean

  visualizer: string

  // ── Misc ───────────────────────────────────────
  dontProxyRadioStreams: boolean
}

/**
 * Shape of the JSON config-file override.
 * Every field is optional — only present keys override the environment.
 */
export type ConfigFile = Partial<AppConfig>
