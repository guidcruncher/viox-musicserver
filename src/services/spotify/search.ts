// src/services/spotify/search.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market } from "./types"
import { UsersApi } from "./users"

export class SearchApi {
  private users: UsersApi

  constructor(private http: AxiosInstance) {
    this.users = new UsersApi(http)
  }

  async search(
    q: string,
    types: ("album" | "artist" | "playlist" | "track" | "show" | "episode" | "audiobook")[],
    options: { market?: Market; limit?: number; offset?: number; include_external?: "audio" } = {},
  ) {
    const opts = options
    const user = await this.users.getCurrentUserProfile()
    if (user) {
      opts.market = user.country
    }

    const res = await this.http.get("/search", {
      params: {
        q,
        type: types.join(","),
        ...opts,
      },
    })
    return stripSpotifyFields(res.data)
  }

  async getRecommendations(opts: {
    seed_artists?: string
    seed_tracks?: string
    seed_genres?: string
    limit?: number
    market?: string
    min_energy?: number
    max_energy?: number
    // etc, as needed
  }) {
    const res = await this.http.get("/recommendations", { params: opts })
    return stripSpotifyFields(res.data)
  }
}
