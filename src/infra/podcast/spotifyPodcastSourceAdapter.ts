import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import { MediaItem, PodcastSourceAdapter } from "@/types"

export class SpotifyPodcastSourceAdapter implements PodcastSourceAdapter {
  readonly id = "spotify"

  readonly normalizer = new SpotifyNormalizer()

  private readonly api = new SpotifyWebClient()

  async getPodcast(id: string): Promise<MediaItem | undefined> {
    const raw = await this.api.getShow(id)
    if (!raw) return undefined

    return this.normalizer.normalize(raw)
  }

  async getEpisodes(id: string): Promise<MediaItem[] | undefined> {
    const raw: any[] = await this.api.getAllShowEpisodes(id)

    if (!raw || raw.length <= 0) return undefined

    return raw.map((item: any) => this.normalizer.normalize(item))
  }
}
