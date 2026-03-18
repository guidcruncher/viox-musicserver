// src/services/spotify/episodes.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market } from "./types"

export class EpisodesApi {
  constructor(private http: AxiosInstance) {}

  async getEpisode(id: string, opts: { market?: Market } = {}) {
    const res = await this.http.get(`/episodes/${id}`, { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getEpisodes(ids: string[], opts: { market?: Market } = {}) {
    const res = await this.http.get("/episodes", {
      params: {
        ids: ids.join(","),
        ...opts,
      },
    })
    return stripSpotifyFields(res.data)
  }
}
