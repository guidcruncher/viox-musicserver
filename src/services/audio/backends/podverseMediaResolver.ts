import { extractId } from "../../idParser"
import { podverseClient } from "../../podverse/podverseClient"
import { BackendMediaResolver, ResolverContext } from "./backendMediaResolver"

export class PodverseMediaResolver implements BackendMediaResolver {
  async resolve(ctx: ResolverContext) {
    const { id, opts, logger } = ctx

    logger.debug("Looking in Podverse")
    let episode = await podverseClient.episode.getEpisodeById(id)

    if (!episode && opts.podcastId) {
      logger.debug("Not found in Podverse, checking feed")
      const episodes = await podverseClient.episode.getEpisodesFromFeed(extractId(opts.podcastId))
      episode = episodes.find((t: any) => extractId(t.id) === extractId(id))
    }

    if (!episode) {
      logger.debug("Not found in Podverse or feed")
      return undefined
    }

    logger.debug("Found episode in Podverse")
    return {
      id: `${episode.id}`,
      title: episode.title ?? "",
      subtitle: episode.description ?? "",
      img: episode.imageUrl ?? "",
      artist: "",
      type: "episode",
      uri: podverseClient.episode.proxyUrl(episode.id, episode.mediaUrl),
      format: "mpeg",
      isFolder: false,
    }
  }
}
