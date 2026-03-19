import { TuneInNormalizer } from "@/core/normalizers/tuneInNormalizer"
import { TuneInWebClient } from "@/infra/tunein/tuneinWebClient"
import type { AudioSourceAdapter, MediaItem, MediaSourceRef } from "@/types"

export class TuneInSourceAdapter implements AudioSourceAdapter {
  readonly id = "tunein"

  private readonly api = new TuneInWebClient()
  private readonly normalize = new TuneInNormalizer()

  async search(query: string): Promise<MediaItem[]> {
    const stations = await this.api.search(query)
    return stations.map((s) => this.normalize.normalize(s))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const station = await this.api.getStation(ref.sourceId)
    return station ? this.normalize.normalize(station) : null
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    return await this.api.getPlaybackUrl(ref.sourceId)
  }

  async browse(): Promise<MediaItem[]> {
    return []
  }
}
