// src/services/spotify/playlists.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market, Paging } from "./types"

export class PlaylistsApi {
  constructor(private http: AxiosInstance) {}

  async getPlaylist(
    id: string,
    opts: { market?: Market; fields?: string; additional_types?: string } = {},
  ) {
    const res = await this.http.get(`/playlists/${id}`, { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getPlaylistItems(
    id: string,
    opts: {
      market?: Market
      fields?: string
      limit?: number
      offset?: number
      additional_types?: string
    } = {},
  ): Promise<Paging<any>> {
    const res = await this.http.get(`/playlists/${id}/items`, { params: opts })
    return res.data
  }

  async addItemsToPlaylist(id: string, uris: string[], opts: { position?: number } = {}) {
    const res = await this.http.post(`/playlists/${id}/tracks`, { uris, ...opts }, {})
    return stripSpotifyFields(res.data)
  }

  async removeItemsFromPlaylist(id: string, uris: string[]) {
    const res = await this.http.request({
      url: `/playlists/${id}/tracks`,
      method: "DELETE",
      data: {
        tracks: uris.map((uri) => ({ uri })),
      },
    })
    return stripSpotifyFields(res.data)
  }

  async changePlaylistDetails(
    id: string,
    body: { name?: string; public?: boolean | null; collaborative?: boolean; description?: string },
  ) {
    await this.http.put(`/playlists/${id}`, body)
  }
}
