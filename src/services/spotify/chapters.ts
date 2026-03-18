// src/services/spotify/chapters.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market } from "./types"

export class ChaptersApi {
  constructor(private http: AxiosInstance) {}

  async getChapter(id: string, opts: { market?: Market } = {}) {
    const res = await this.http.get(`/chapters/${id}`, { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getChapters(ids: string[], opts: { market?: Market } = {}) {
    const res = await this.http.get("/chapters", {
      params: {
        ids: ids.join(","),
        ...opts,
      },
    })
    return stripSpotifyFields(res.data)
  }
}
