// src/services/spotify/shows.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
import { Market } from "./types"
import { UsersApi } from "./users"

export class ShowsApi {
  private users: UsersApi

  constructor(private http: AxiosInstance) {
    this.users = new UsersApi(http)
  }

  async getShow(id: string, opts: { market?: Market } = {}) {
    const res = await this.http.get(`/shows/${id}`, { params: opts })
    if (!res.data) {
      return undefined
    }
    return {
      id: res.data.uri,
      title: res.data.name,
      subtitle: res.data.description,
      img: res.data.images[0].url,
      artist: "",
      type: "spotify",
      uri: res.data.uri,
      format: "show",
      isFolder: false,
    }
  }

  async getShows(ids: string[], opts: { market?: Market } = {}) {
    const user = await this.users.getCurrentUserProfile()
    const passOpts = opts
    if (user) {
      passOpts.market = user.country
    }

    const res = await this.http.get("/shows", {
      params: {
        ids: ids.join(","),
        ...passOpts,
      },
    })
    return stripSpotifyFields(res.data)
  }

  async getShowEpisodes(
    id: string,
    opts: { market?: Market; limit?: number; offset?: number } = {},
  ) {
    const user = await this.users.getCurrentUserProfile()
    const passOpts = opts
    if (user) {
      passOpts.market = user.country
    }

    const res = await this.http.get(`/shows/${id}/episodes`, { params: passOpts })
    if (!res.data) {
      return []
    }

    return res.data.items.map((t: any) => {
      return {
        id: t.uri,
        title: t.name,
        subtitle: t.description,
        img: t.images[0].url,
        artist: "",
        type: "spotify",
        uri: t.uri,
        format: "episode",
        isFolder: false,
      }
    })
  }
}
