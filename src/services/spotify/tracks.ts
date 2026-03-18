// src/services/spotify/tracks.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { FullTrack, Market } from "./types"

export class TracksApi {
  constructor(private http: AxiosInstance) {}

  async getTrack(id: string, market?: Market): Promise<FullTrack> {
    const res = await this.http.get(`/tracks/${id}`, {
      params: market ? { market } : undefined,
    })
    return stripSpotifyFields(res.data)
  }

  async getTracks(ids: string[], market?: Market): Promise<{ tracks: FullTrack[] }> {
    const res = await this.http.get(`/tracks`, {
      params: {
        ids: ids.join(","),
        ...(market ? { market } : {}),
      },
    })
    return stripSpotifyFields(res.data)
  }
}
