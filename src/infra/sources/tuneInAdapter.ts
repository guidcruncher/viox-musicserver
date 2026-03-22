import { TuneInNormalizer } from "@/core/normalizers/tuneInNormalizer"
import { TuneInWebClient } from "@/infra/tunein/tuneinWebClient"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"

export class TuneInSourceAdapter implements AudioSourceAdapter {
  readonly id = "tunein"

  private readonly api = new TuneInWebClient()
  private readonly normalize = new TuneInNormalizer()

  async search(query: string): Promise<MediaItem[]> {
    const stations = await this.api.search(query)
    return stations.map((s) => this.normalize.normalize(s))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    const station = await this.api.getStation(ref.sourceId)
    return station ? this.normalize.normalize(station) : undefined
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    const url = await this.api.getPlaybackUrl(ref.sourceId)
    if (!url) {
      return undefined
    }
    return url
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    const items = await this.api.browse(options.cursor ?? "")

    if (!items) return []

    return items
      .filter((t: any) => !t.guide_id)
      .map((t: any) => {
        return this.normalize.normalize(t)
      })
  }
}
