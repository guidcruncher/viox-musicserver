import { FileDownloader,NullDownload } from "@/infra/networking/downloadFile"
import { SqliteSubscriptionEpisodesStore } from "@/infra/subscriptionEpisodesStore"
import { SqliteSubscriptionsStore } from "@/infra/subscriptionsStore"
import { logger } from "@/logger"
import { AudioSource, MediaItem, Subscription, SubscriptionEpisode } from "@/types"

import { podcastSourceRegistry } from "./podcastSourceRegistry"

export class PodcastIndexer {
  constructor(
    private readonly downloader: FileDownloader = new NullDownload(),
    private readonly subscriptions = new SqliteSubscriptionsStore(),
    private readonly episodes = new SqliteSubscriptionEpisodesStore(),
  ) {}

  async isSubscribed(id: string): Promise<boolean> {
    const sub = this.subscriptions.get(id)
    return !!sub
  }

  async subscribe(item: MediaItem): Promise<Subscription> {
    return await this.subscriptions.create({
      id: item.id,
      source: item.sourceRef.source,
      item_type: item.sourceRef.itemType,
      source_id: item.sourceRef.sourceId,
      parent_source_id: "",
      source_uri: item.sourceRef.uri,
      title: item.title,
      subtitle: item.subtitle,
      image_url: item.imageUrl,
      lastpublished_at: 0,
      lastlistened_at: 0,
    })
  }

  async unsubscribe(item: MediaItem): Promise<void> {
    await this.subscriptions.delete(item.id)
    await this.episodes.deleteAllForSubscription(item.id)
  }

  /**
   * Index all subscribed podcasts.
   */
  async indexAll(): Promise<void> {
    logger.info("starting podcast index")

    const subs = this.subscriptions.list()

    for (const sub of subs) {
      if (sub.item_type !== "podcast" && sub.item_type !== "show") {
        continue
      }

      await this.indexOne(sub.id)
    }

    logger.info("finished podcast index")
  }

  /**
   * Index a single podcast subscription by internal VIOX ID.
   */
  async indexOne(subscriptionId: string): Promise<void> {
    const sub = this.subscriptions.get(subscriptionId)
    if (!sub) {
      logger.warn("subscription not found", { subscriptionId })
      return
    }

    const adapter = podcastSourceRegistry(sub.source as AudioSource)
    if (!adapter) {
      logger.warn("no adapter for source", { source: sub.source })
      return
    }

    logger.info("indexing podcast", { subscriptionId, source: sub.source })

    const episodes = await adapter.getEpisodes(sub.source_id)

    if (!episodes || episodes.length === 0) {
      logger.info("no episodes returned", { subscriptionId })
      return
    }

    for (const ep of episodes) {
      await this.processEpisode(sub.id, ep)
    }

    const lastPublished = new Date(episodes[0].releaseDate ?? new Date()).getTime()

    logger.info("updating subscription timestamps", { subscriptionId, lastPublished })
    if (lastPublished) {
      await this.subscriptions.updateLastPublished(sub.id, lastPublished)
    }

    await this.subscriptions.updateLastUpdate(sub.id)
  }

  /**
   * Insert a new episode if it does not already exist.
   */
  private async processEpisode(subscriptionId: string, episode: MediaItem): Promise<void> {
    const existing = this.episodes.get(episode.id)
    if (existing) {
      return // idempotent
    }

    const row = {
      id: episode.id,
      source: episode.sourceRef.source,
      item_type: episode.sourceRef.itemType,
      source_id: episode.sourceRef.sourceId,
      parent_source_id: subscriptionId,
      source_uri: episode.sourceRef.uri ?? null,
      title: episode.title,
      subtitle: episode.subtitle ?? null,
      image_url: episode.imageUrl ?? null,
      duration_ms: episode.durationMs ?? null,
      listened: 0,
      published_at: episode.releaseDate
        ? new Date(episode.releaseDate).getTime()
        : new Date().getTime(),
    }

    this.episodes.create(row)

    if (this.downloader && row.source_uri) {
      logger.info(`Downloading episode locally to cache.`)
      await this.downloader.downloadFile(row.source_uri, {})
    }

    logger.info("new episode indexed", { episodeId: episode.id, subscriptionId })
  }

  async getPodcast(id: string): Promise<any | undefined> {
    const podcast = await this.subscriptions.get(id)
    if (!podcast) return undefined

    const episodes = await this.episodes.listForSubscription(id)

    return { podcast, episodes }
  }

  async markAsListened(episodeId: string): Promise<SubscriptionEpisode | undefined> {
    const episode = this.episodes.get(episodeId)

    if (!episode) {
      logger.warn("episode not found", { episodeId })
      return undefined
    }

    if (episode.parent_source_id) {
      await this.subscriptions.updateLastListened(episode.parent_source_id)
    }

    await this.episodes.markListened(episodeId)
    return episode
  }
}
