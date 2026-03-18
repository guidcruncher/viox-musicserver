// src/services/spotify/audiobooks.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market } from "./types"

export class AudiobooksApi {
  constructor(private http: AxiosInstance) {}

  async getAudiobook(id: string, opts: { market?: Market } = {}) {
    const res = await this.http.get(`/audiobooks/${id}`, { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getAudiobooks(ids: string[], opts: { market?: Market } = {}) {
    const res = await this.http.get("/audiobooks", {
      params: {
        ids: ids.join(","),
        ...opts,
      },
    })
    return stripSpotifyFields(res.data)
  }

  async getAudiobookChapters(
    id: string,
    opts: { market?: Market; limit?: number; offset?: number } = {},
  ) {
    const res = await this.http.get(`/audiobooks/${id}/chapters`, { params: opts })
    return stripSpotifyFields(res.data)
  }
}
