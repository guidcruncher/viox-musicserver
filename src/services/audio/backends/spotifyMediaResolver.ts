import { spotifyWebApi } from "../../spotify/spotifyWebClient"
import { BackendMediaResolver, ResolverContext } from "./backendMediaResolver"

export class SpotifyMediaResolver implements BackendMediaResolver {
  async resolve(ctx: ResolverContext) {
    ctx.logger.debug(`Looking in Spotify for ${ctx.id}`)
    return spotifyWebApi.getMediaItem(ctx.id)
  }
}
