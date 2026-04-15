import axios from "axios"
import type { FastifyInstance } from "fastify"
import querystring from "querystring"

import { config, spotifyScopes } from "@/config"
import { spotifyAuthClient } from "@/infra/spotify/spotifyAuthClient"
import { spotifyTokenStore } from "@/infra/spotify/spotifyTokenStore"
import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerSpotifyAuthRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering SPotify Auth routes")

  app.get("/api/spotify/login", async (req: any, reply: any) => {
    const params = querystring.stringify({
      client_id: config.spotifyClientId,
      response_type: "code",
      redirect_uri: config.spotifyRedirectUrl,
      scope: spotifyScopes,
    })

    reply.redirect(`https://accounts.spotify.com/authorize?${params}`)
  })

  app.get("/api/spotify/auth/callback", async (req: any, reply: any) => {
    const { code } = req.query

    const params = new URLSearchParams()
    params.set("grant_type", "authorization_code")
    params.set("code", code)
    params.set("redirect_uri", config.spotifyRedirectUrl)

    const authHeader = Buffer.from(
      `${config.spotifyClientId}:${config.spotifyClientSecret}`,
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

    const callbackUrl = `${config.callbackUrl}?token=${data.access_token}`
    reply.redirect(callbackUrl)
  })

  app.get("/api/spotify/auth", async (req: any, reply: any) => {
    const tokenData = await spotifyTokenStore.load()

    if (!tokenData) {
      return reply.status(401).send({ error: "Not authenticated" })
    }

    reply.status(200).send(tokenData.accessToken)
  })
}
