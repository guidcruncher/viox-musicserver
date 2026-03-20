import axios from "axios"
import type { FastifyInstance } from "fastify"
import querystring from "querystring"

import { getConfig, spotifyScopes } from "@/config"
import { spotifyAuthClient } from "@/infra/spotify/spotifyAuthClient"
import { spotifyTokenStore } from "@/infra/spotify/spotifyTokenStore"
import type { VioxBackend } from "@/types"

export function registerSpotifyAuthRoutes(app: FastifyInstance, _backend: VioxBackend) {
  app.get("/api/spotify/login", async (req: any, reply: any) => {
    const params = querystring.stringify({
      client_id: getConfig("spotifyClientId"),
      response_type: "code",
      redirect_uri: `${getConfig("spotifyRedirectUrl")}`,
      scope: spotifyScopes,
    })

    reply.redirect(`https://accounts.spotify.com/authorize?${params}`)
  })

  app.get("/api/spotify/auth/callback", async (req: any, reply: any) => {
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
  })
}
