// infra/sources/podverse-adapter.ts
import { PodverseNormalizer } from "@/core/normalizers/podverseNormalizer"
import { PodverseWebClient } from "@/infra/podverse/podverseWebClient"
import { logger } from "@/logger"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class PodverseSourceAdapter implements AudioSourceAdapter {
  readonly id = "podverse"
  readonly caps = Capabilities.audioSources[this.id]

  private readonly api = new PodverseWebClient()
  private readonly normalize = new PodverseNormalizer()

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const items = await this.api.searchPodcasts(query, offset, limit)
    if (!items) return []
    return items.map((t: any) => this.normalize.normalize(t))
  }

  async getItems(ref: MediaSourceRef): Promise<MediaItem[] | undefined> {
    logger.debug(`Getting items for ${JSON.stringify(ref)}`)
    const items = await this.api.getEpisodesForPodcast(ref.sourceId)

    if (items) {
      return items.map((t: any) => this.normalize.normalize(t))
    }
    return undefined
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    let raw: any

    if (ref.itemType === "podcast") {
      raw = await this.api.getPodcast(ref.sourceId)
    } else if (ref.itemType === "episode") {
      raw = await this.api.getEpisode(ref.sourceId)
    } else {
      return undefined
    }

    return this.normalize.normalize(raw)
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    if (ref.itemType !== "episode") {
      logger.error(`Unexpected item type  "${ref.itemType}"`)
      return undefined
    }
    const raw = await this.api.getEpisode(ref.sourceId, ref.parentSourceId)
    if (!raw) {
      logger.error(`Cannot resolve playback uri for episode ${ref.sourceId}`)
      return undefined
    }

    logger.debug(`Playback uri for episode ${ref.sourceId} url ${raw?.mediaUrl ?? undefined}`)
    return raw?.mediaUrl ?? undefined
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    const data: any[] = []

    const categories: any[] = await this.api.getCategories(options.cursor)
    if (categories && categories.length > 0) {
      data.push(...categories.map((t: any) => this.normalize.fromCategory(t)))
    }

    if (options.cursor) {
      const podcasts: any[] = await this.api.getPodcastsForCategory([options.cursor ?? ""])
      if (podcasts && podcasts.length > 0)
        data.push(...podcasts[0].map((t: any) => this.normalize.fromPodcast(t)))
    }

    return data
      .sort((a: any, b: any) => a.title.localeCompare(b.title))
      .slice(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 20))
  }
}
