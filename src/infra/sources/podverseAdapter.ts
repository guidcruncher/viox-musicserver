// infra/sources/podverse-adapter.ts
import type { AudioSourceAdapter, MediaItem, MediaSourceRef, BrowseOptions } from "@/types"

import { PodverseWebClient } from "@/infra/podverse/PodverseWebClient"
import { PodverseNormalizer } from "@/core/normalizers/podverse-normalizer"

export class PodverseSourceAdapter implements AudioSourceAdapter {
  readonly id = "podverse"

  private readonly api = new PodverseWebClient()
  private readonly normalize = new PodverseNormalizer()

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.api.searchPodcasts({ searchTitle: query })
    return raw.map((p: any) => this.normalize.normalize(p))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    let raw: any

    if (ref.itemType === "podcast") {
      raw = await this.api.getPodcast(ref.sourceId)
    } else if (ref.itemType === "episode") {
      raw = await this.api.getEpisode(ref.sourceId)
    } else {
      return null
    }

    return this.normalize.normalize(raw)
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    if (ref.itemType !== "episode") return null
    const raw = await this.api.getEpisode(ref.sourceId)
    return raw?.mediaUrl ?? null
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    if (!options.ref || options.ref.itemType !== "podcast") return []

    const raw = await this.api.getEpisodesForPodcast(options.ref.sourceId)
    return raw.map((e: any) => this.normalize.normalize(e))
  }
}
