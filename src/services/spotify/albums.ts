// src/services/spotify/albums.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { FullAlbum, Market, Paging, SimplifiedTrack } from "./types"

export class AlbumsApi {
  constructor(private http: AxiosInstance) {}

  async getAlbum(id: string, market?: Market): Promise<FullAlbum> {
    const res = await this.http.get(`/albums/${id}`, {
      params: market ? { market } : undefined,
    })
    return stripSpotifyFields(res.data)
  }

  async getAlbums(ids: string[], market?: Market): Promise<{ albums: FullAlbum[] }> {
    const res = await this.http.get(`/albums`, {
      params: {
        ids: ids.join(","),
        ...(market ? { market } : {}),
      },
    })
    return stripSpotifyFields(res.data)
  }

  async getAlbumTracks(
    id: string,
    opts: { market?: Market; limit?: number; offset?: number } = {},
  ): Promise<Paging<SimplifiedTrack>> {
    const res = await this.http.get(`/albums/${id}/tracks`, { params: opts })
    return stripSpotifyFields(res.data)
  }
}
