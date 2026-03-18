import { youtubePlayer } from "../../youtube/youtubePlayer"
import { BackendMediaResolver, ResolverContext } from "./backendMediaResolver"

export class YouTubeMediaResolver implements BackendMediaResolver {
  async resolve(ctx: ResolverContext) {
    ctx.logger.debug(`Looking in YouTube for ${ctx.id}`)
    return youtubePlayer.getMediaItem(ctx.parsed.id)
  }
}
