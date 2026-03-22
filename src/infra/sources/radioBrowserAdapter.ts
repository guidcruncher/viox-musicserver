import { RadioBrowserNormalizer } from "@/core/normalizers/radioBrowserNormalizer"
import { RadioBrowserWebClient } from "@/infra/radiobrowser/radioBrowserWebClient"
import type { AudioSourceAdapter, MediaItem, MediaSourceRef } from "@/types"

export class RadioBrowserSourceAdapter implements AudioSourceAdapter {
  readonly id = "radiobrowser"

  private readonly api = new RadioBrowserWebClient()
  private readonly normalize = new RadioBrowserNormalizer()

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.api.search({ name: query, hidebroken: true })
    if (!raw) return []
    return raw.map((s) => this.normalize.normalize(s))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    const station = await this.api.getStation(ref.sourceId)
    return station ? this.normalize.normalize(station) : undefined
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    const station = await this.api.getStation(ref.sourceId)
    return station?.url_resolved ?? station?.url ?? undefined
  }

  async browse(): Promise<MediaItem[]> {
    return []
  }
}
