// src/services/spotify/users.ts

import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"
export class UsersApi {
  constructor(private http: AxiosInstance) {}

  async getCurrentUserProfile() {
    const res = await this.http.get("/me")
    return stripSpotifyFields(res.data)
  }

  async getUserProfile(userId: string) {
    const res = await this.http.get(`/users/${userId}`)
    return stripSpotifyFields(res.data)
  }

  async getCurrentUserPlaylists(opts: { limit?: number; offset?: number } = {}) {
    const res = await this.http.get("/me/playlists", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getUserPlaylists(userId: string, opts: { limit?: number; offset?: number } = {}) {
    const res = await this.http.get(`/users/${userId}/playlists`, { params: opts })
    return stripSpotifyFields(res.data)
  }
}
