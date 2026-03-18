// src/routes/spotify/spotifyLogin.ts
import { spotifyWebApi } from "../../services/spotify/spotifyWebClient"

export async function spotifyUser(app: any) {
  app.get(
    "/spotify/user/me",
    {
      schema: {
        tags: ["Authorization"],
      },
    },
    async (req: any, reply: any) => {
      const user = await spotifyWebApi.users.getCurrentUserProfile()
      return reply.send(user)
    },
  )
}
