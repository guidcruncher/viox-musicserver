// src/services/spotify/artists.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { artistBioService } from "./artistBioService"
import { MediaItemMapper } from "./mediaItemMappers"
import { Market } from "./types"

export class ArtistsApi {
  constructor(private http: AxiosInstance) {}

  async getArtist(id: string) {
    const res = await this.http.get(`/artists/${id}`)
    const data: any = stripSpotifyFields(res.data)
    const bio: any = await artistBioService.getArtistByName(data.name)
    if (bio) {
      data.bio = bio
    }
    return data
  }

  async getArtists(ids: string[]) {
    const res = await this.http.get(`/artists`, {
      params: { ids: ids.join(",") },
    })
    return stripSpotifyFields(res.data)
  }

  async getArtistAlbums(
    id: string,
    opts: { include_groups?: string; market?: Market; limit?: number; offset?: number } = {},
  ) {
    const res = await this.http.get(`/artists/${id}/albums`, { params: opts })
    return stripSpotifyFields(res.data.items).map((t: any) => {
      return MediaItemMapper.fromAlbum(t)
    })
  }

  async getArtistTopTracks(id: string, market: Market) {
    const res = await this.http.get(`/artists/${id}/top-tracks`, {
      params: { market },
    })
    return stripSpotifyFields(res.data.tracks).map((t: any) => {
      return MediaItemMapper.fromTrack(t)
    })
  }

  async getRelatedArtists(id: string) {
    const res = await this.http.get(`/artists/${id}/related-artists`)
    return stripSpotifyFields(res.data)
  }
}
