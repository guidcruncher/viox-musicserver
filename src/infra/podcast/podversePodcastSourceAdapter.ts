import { PodverseNormalizer } from "@/core/normalizers/podverseNormalizer"
import { PodverseWebClient } from "@/infra/podverse/podverseWebClient"
import { MediaItem, PodcastSourceAdapter } from "@/types"

export class PodversePodcastSourceAdapter implements PodcastSourceAdapter {
  readonly id = "podverse"

  readonly normalizer = new PodverseNormalizer()

  private readonly api = new PodverseWebClient()

  async getPodcast(id: string): Promise<MediaItem | undefined> {
    const raw = await this.api.getPodcast(id)
    if (!raw) return undefined

    return this.normalizer.normalize(raw)
  }

  async getEpisodes(id: string): Promise<MediaItem[] | undefined> {
    const raw: any[] = await this.api.getEpisodesForPodcast(id)

    if (!raw || raw.length <= 0) return undefined

    return raw.map((item: any) => this.normalizer.normalize(item))
  }
}
