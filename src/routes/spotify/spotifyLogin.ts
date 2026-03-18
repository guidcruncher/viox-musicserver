// src/routes/spotify/spotifyLogin.ts
import querystring from "querystring"

import { getConfig, spotifyScopes } from "@/config"

export async function spotifyLogin(app: any) {
  app.get(
    "/spotify/login",
    {
      schema: {
        tags: ["Authorization"],
      },
    },
    async (req: any, reply: any) => {
      const params = querystring.stringify({
        client_id: getConfig("spotifyClientId"),
        response_type: "code",
        redirect_uri: `${getConfig("spotifyRedirectUrl")}`,
        scope: spotifyScopes,
      })

      reply.redirect(`https://accounts.spotify.com/authorize?${params}`)
    },
  )
}
