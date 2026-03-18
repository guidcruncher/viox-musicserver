import { MediaItem } from "../../types/media-types"
import { InvokeIndexer } from "./podverseIndexerDaemon"
import { SqliteCache } from "./sqliteCache"
import { SqliteSubscriptionStore } from "./sqliteSubscriptionStore"

export class PodcastSubscriptionService {
  private store: SqliteSubscriptionStore = new SqliteSubscriptionStore()
  private cache: SqliteCache = new SqliteCache()

  async subscribe(podcastId: string): Promise<void> {
    this.store.subscribe(podcastId)
    await InvokeIndexer()
  }

  async unsubscribe(podcastId: string): Promise<void> {
    this.store.unsubscribe(podcastId)
  }

  async toggle(podcastId: string): Promise<void> {
    if (this.store.isSubscribed(podcastId)) {
      this.store.unsubscribe(podcastId)
    } else {
      this.store.subscribe(podcastId)
    }
  }

  async isSubscribed(podcastId: string): Promise<boolean> {
    return this.store.isSubscribed(podcastId)
  }

  async getSubscriptions(): Promise<string[]> {
    return this.store.getSubscriptions()
  }

  async getSubscriptionDetails(): Promise<MediaItem[]> {
    return this.store.getSubscriptionDetails()
  }

  async getPodcasts(): Promise<MediaItem[]> {
    return this.store.getSubscriptionDetails()
  }

  private normalizeImageUrl(episodeUrl: string, podcastUrl: string | undefined): string {
    if (episodeUrl == "") {
      return podcastUrl ?? ""
    }
    return episodeUrl
  }

  async getEpisodes(podcastId: string): Promise<MediaItem[]> {
    const episodes = this.cache.getEpisodesForPodcast(podcastId)
    const podcast = this.cache.getPodcast(podcastId)

    return episodes.map((t: any) => {
      return {
        id: t.id,
        title: t.title,
        subtitle: t.description,
        img: this.normalizeImageUrl(t.imageUrl, podcast ? podcast.imageUrl : ""),
        artist: "",
        type: "episode",
        uri: this.proxyUrl(t.id, t.mediaUrl),
        format: "mpeg",
        isFolder: false,
      }
    })
  }

  private proxyUrl(id: string, url: string): string {
    return `http://127.0.0.1:8080/api/proxy/podcast?id=${encodeURIComponent(id)}&url=${encodeURIComponent(url)}`
  }

  async setListened(episodeId: string, listened: boolean = true): Promise<void> {
    this.cache.setListened(episodeId, listened)
  }
}
