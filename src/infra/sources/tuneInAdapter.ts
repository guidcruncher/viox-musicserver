import { TuneInNormalizer } from "@/core/normalizers/tuneInNormalizer"
import { TuneInWebClient } from "@/infra/tunein/tuneinWebClient"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class TuneInSourceAdapter implements AudioSourceAdapter {
  readonly id = "tunein"
  readonly caps = Capabilities.audioSources[this.id]

  private readonly api = new TuneInWebClient()
  private readonly normalize = new TuneInNormalizer()

  async getItems(_ref: MediaSourceRef): Promise<MediaItem[] | undefined> {
    return undefined
  }

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const stations: any[] = await this.api.search(query)

    if (stations)
      return stations
        .slice(offset ?? 0, (limit ?? 20) + (offset ?? 0))
        .map((s: any) => this.normalize.normalize(s))

    return []
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
      .filter((t: any) => t.guide_id)
      .slice(options.offset, (options.offset ?? 0) + (options.limit ?? 20))
      .map((t: any) => {
        return this.normalize.normalize(t)
      })
  }
}
