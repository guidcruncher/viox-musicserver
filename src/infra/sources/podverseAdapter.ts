// infra/sources/podverse-adapter.ts
import { PodverseNormalizer } from "@/core/normalizers/podverseNormalizer"
import { PodverseWebClient } from "@/infra/podverse/podverseWebClient"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"

export class PodverseSourceAdapter implements AudioSourceAdapter {
  readonly id = "podverse"

  private readonly api = new PodverseWebClient()
  private readonly normalize = new PodverseNormalizer()

  async search(_query: string): Promise<MediaItem[]> {
    return []
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
if (!raw) return null
    return raw?.mediaUrl ?? null
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    if (!options.ref || options.ref.itemType !== "podcast") return []

    const raw = await this.api.getEpisodesForPodcast(options.ref.sourceId)
    return raw.map((e: any) => this.normalize.normalize(e))
  }
}
