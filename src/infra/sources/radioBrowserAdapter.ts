import { RadioBrowserNormalizer } from "@/core/normalizers/radioBrowserNormalizer"
import { RadioBrowserWebClient } from "@/infra/radiobrowser/radioBrowserWebClient"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class RadioBrowserSourceAdapter implements AudioSourceAdapter {
  readonly id = "radiobrowser"
  readonly caps = Capabilities.audioSources[this.id]

  private readonly api = new RadioBrowserWebClient()
  private readonly normalize = new RadioBrowserNormalizer()

  async getItems(_ref: MediaSourceRef): Promise<MediaItem[] | undefined> {
    return undefined
  }

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const raw = await this.api.search({ name: query, offset, limit })
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

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    if (!options.cursor || options.cursor == "" || options.cursor == "r0") {
      const countrys = await this.api.getCountries()
      return countrys
        .slice(options.offset, (options.offset ?? 0) + (options.limit ?? 20))
        .map((t: any) => {
          return this.normalize.normalizeCountry(t)
        })
    }

    const items = await this.api.search({
      countrycode: options.cursor,
      offset: options.offset ?? 0,
      limit: options.limit ?? 20,
    })

    if (!items) {
      return []
    }

    return items.map((t) => {
      return this.normalize.normalize(t)
    })
  }
}
