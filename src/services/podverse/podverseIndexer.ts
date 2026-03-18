import { getLogger } from "../../logger"
import { rfcToIso8601 } from "../../types/formatters"
import { MediaItem } from "../../types/media-types"
import { PodverseClient } from "./podverseClient"
import { RssEpisodeParser } from "./RSSEpisodeParser"
import { SqliteCache } from "./sqliteCache"
import { SqliteStateStore } from "./sqliteStateStore"
import { SqliteSubscriptionStore } from "./sqliteSubscriptionStore"

export class PodverseIndexer {
  constructor(
    private client: PodverseClient,
    private state: SqliteStateStore,
    private cache: SqliteCache,
    private subscriptions: SqliteSubscriptionStore,
  ) {}

  async indexNewEpisodes() {
    const logger = getLogger()
    const subscribedIds = this.subscriptions.getSubscriptions()
    logger.debug("Starting indexer")

    if (subscribedIds.length === 0) {
      logger.warn("No subscriptions, nothing to index")
      return []
    }

    const newItems: MediaItem[] = []

    logger.debug("Retrieving podcasts")
    // 2. Fetch each subscribed podcast individually
    for (const podcastId of subscribedIds) {
      let podcast
      try {
        podcast = await this.client.podcast.getPodcastById(podcastId)
        this.cache.upsertPodcast(podcast)
      } catch (err) {
        logger.error(`Error processing podcast ${podcastId} - ${err}`)
        continue
      }

      try {
        const lastDate = this.state.getLastIndexedDate(podcast.id)
        let episodes: any[] = await this.client.episode.getEpisodes({
          podcastId: podcast.id,
          includePodcast: true,
          sort: "pubDate",
        })

        if (episodes.length == 0) {
          const feedUrl = podcast.feedUrls
            ? podcast.feedUrls.length > 0
              ? podcast.feedUrls[0].url
              : ""
            : ""
          if (feedUrl != "") {
            episodes = await RssEpisodeParser.parse(podcast.id, feedUrl)
          }
        }

        const newEpisodes = lastDate
          ? episodes.filter((e) => e.pubDate && e.pubDate > lastDate)
          : episodes
        for (const ep of newEpisodes) {
          this.cache.upsertEpisode(ep)
          newItems.push(this.client.toMediaItem(ep))
        }
        // Update state
        const newest = episodes[0]?.pubDate
        if (newest) {
          this.state.setLastIndexedDate(podcast.id, rfcToIso8601(newest))
        }
      } catch (err) {
        logger.error(`Error processing episodes for podcast ${podcastId} - ${err}`)
      }
    }

    logger.debug("Finished indexing")
    return newItems
  }
}
