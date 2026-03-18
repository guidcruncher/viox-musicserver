// src/routes/spotify/spotifyCallback.ts
import axios from "axios"

import { getConfig } from "@/config"

import { spotifyAuthClient } from "../../services/spotify/spotifyAuthClient"
import { spotifyTokenStore } from "../../services/spotify/spotifyTokenStore"

export async function spotifyCallback(app: any) {
  app.get(
    "/spotify/auth/callback",
    {
      schema: {
        tags: ["Authorization"],
        query: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string" },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const { code } = req.query

      const params = new URLSearchParams()
      params.set("grant_type", "authorization_code")
      params.set("code", code)
      params.set("redirect_uri", getConfig("spotifyRedirectUrl"))

      const authHeader = Buffer.from(
        `${getConfig("spotifyClientId")}:${getConfig("spotifyClientSecret")}`,
      ).toString("base64")

      const res = await axios.post("https://accounts.spotify.com/api/token", params, {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })

      const data = res.data
      const user = await spotifyAuthClient.getCurrentUser(data.access_token)

      // Persist refresh token + access token
      await spotifyTokenStore.save({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresAt: Date.now() + data.expires_in * 1000,
        username: user ? user.id : "",
      })

      const callbackUrl = `${getConfig("callbackUrl")}?token=${data.access_token}`
      reply.redirect(callbackUrl)
    },
  )
}
