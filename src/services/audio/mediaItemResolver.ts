import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { parseId } from "../idParser"
import { youtubePlayer } from "../youtube/youtubePlayer"
import { BACKEND_MEDIA_RESOLVERS } from "./backends"

class MediaItemResolver {
  async patchPlaybackUrl(item: MediaItem): Promise<MediaItem> {
    const proxyUrl = await youtubePlayer.getPlaybackUrl(item.id)
    return { ...item, uri: proxyUrl }
  }

  async getMediaItem(
    id: string,
    opts: { podcastId?: string; subtype?: string },
  ): Promise<MediaItem | undefined> {
    const logger = getLogger()
    const parsed = parseId(id)

    if (!parsed) {
      logger.error(`Invalid id ${id}`)
      return undefined
    }

    logger.debug(`getMediaItem type: ${parsed.backend} id: ${parsed.id} podcast: ${opts.podcastId}`)

    const resolver = BACKEND_MEDIA_RESOLVERS[parsed.backend]
    if (!resolver) {
      logger.error(`Invalid backend type ${parsed.backend}`)
      return undefined
    }

    return resolver.resolve({ id, parsed, opts, logger })
  }
}

export const mediaItemResolver = new MediaItemResolver()
