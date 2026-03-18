// src/services/spotify/categories.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"

export class CategoriesApi {
  constructor(private http: AxiosInstance) {}

  async getCategories(
    opts: { country?: string; locale?: string; limit?: number; offset?: number } = {},
  ) {
    const res = await this.http.get("/browse/categories", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getCategory(id: string, opts: { country?: string; locale?: string } = {}) {
    const res = await this.http.get(`/browse/categories/${id}`, { params: opts })
    return stripSpotifyFields(res.data)
  }
}
