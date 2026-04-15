// src/services/spotify/spotifyAuthClient.ts

import axios from "axios"

import { config } from "@/config"
import { logger } from "@/logger"

import { spotifyTokenStore, StoredSpotifyToken } from "./spotifyTokenStore"

export const spotifyAuthClient = {
  refreshing: null as Promise<string> | null,

  async getUsername(): Promise<string> {
    const stored = await spotifyTokenStore.load()
    // If we have a valid token, return it
    if (stored && Date.now() < stored.expiresAt - 60_000) {
      return stored.username || ""
    }
    return ""
  },

  async getCurrentUser(accessToken: string | undefined) {
    const token = accessToken || (await this.getAccessToken())

    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return data
  },

  async getAccessToken(): Promise<string> {
    const stored = await spotifyTokenStore.load()

    // If we have a valid token, return it
    if (stored && Date.now() < stored.expiresAt - 60_000) {
      return stored.accessToken
    }

    // Otherwise refresh
    return this.refreshAccessToken()
  },

  async refreshAccessToken(): Promise<string> {
    // Prevent concurrent refreshes
    if (this.refreshing) {
      return this.refreshing
    }

    this.refreshing = (async () => {
      const stored = await spotifyTokenStore.load()

      const refreshToken = stored?.refreshToken || config.spotifyRefreshToken || null

      if (!refreshToken) {
        throw new Error(
          "No Spotify refresh token found. Run /spotify/login and /spotify/callback to authorize.",
        )
      }

      const params = new URLSearchParams()
      params.set("grant_type", "refresh_token")
      params.set("refresh_token", refreshToken)

      const authHeader = Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString("base64")

      const res = await axios.post("https://accounts.spotify.com/api/token", params, {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const data = res.data
      const username = await this.getCurrentUser(data.access_token)

      const newToken: StoredSpotifyToken = {
        accessToken: data.access_token,
        refreshToken: refreshToken, // Spotify rarely returns a new one
        tokenType: data.token_type ?? "Bearer",
        expiresAt: Date.now() + data.expires_in * 1000,
        username: username,
      }

      await spotifyTokenStore.save(newToken)

      this.refreshing = null
      return newToken.accessToken
    })()

    return this.refreshing
  },

  async transferPlaybackToLibrespot() {
    try {
      const token = await this.getAccessToken()

      // 1. Get devices
      const { data } = await axios.get("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const device = data.devices.find((d: any) => d.name === config.spotifyDeviceName)
      if (!device) return null
      logger.info(`Found device: ${device.id}`)

      // 2. Transfer playback
      await axios.put(
        "https://api.spotify.com/v1/me/player",
        {
          device_ids: [device.id],
          play: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
    } catch (err) {
      logger.error("Error transferring to device", err)
    }
  },
}
