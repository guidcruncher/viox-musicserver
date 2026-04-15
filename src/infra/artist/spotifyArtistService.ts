import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import { MediaItem, MediaSourceRef } from "@/types"

import { ArtistSource } from "./types/artist"

export class SpotifyArtistService implements ArtistSource {
  private readonly normalize: SpotifyNormalizer = new SpotifyNormalizer()
  private readonly api: SpotifyWebClient = new SpotifyWebClient()

  async getArtist(name: string): Promise<MediaItem | undefined> {
    const res = await this.api.getArtistByName(name)
    if (!res) return undefined

    return this.normalize.normalize(res)
  }

  async getArtistAlbums(
    ref: MediaSourceRef,
    offset: number,
    limit: number,
  ): Promise<MediaItem[] | undefined> {
    const raw = await this.api.getArtistAlbums(ref.sourceId, offset, limit)
    if (raw) {
      return raw.map((i: any) => this.normalize.normalize(i))
    }

    return []
  }

  async getArtistTracks(
    ref: MediaSourceRef,
    offset: number,
    limit: number,
  ): Promise<MediaItem[] | undefined> {
    const raw = await this.api.getArtistTracks(ref.sourceId, offset, limit)
    if (raw) {
      return raw.map((i: any) => this.normalize.normalize(i))
    }
    return []
  }
}
