import { AxiosInstance } from "axios"

import { Playlist } from "./types"

export class PlaylistService {
  constructor(private http: AxiosInstance) {}

  async getPlaylists(params?: any): Promise<Playlist[]> {
    const res = await this.http.get("/playlist", { params })
    return res.data
  }

  async getById(id: string): Promise<Playlist> {
    const res = await this.http.get(`/playlist/${id}`)
    return res.data
  }

  async create(body: Partial<Playlist>): Promise<Playlist> {
    const res = await this.http.post("/playlist", body)
    return res.data
  }

  async update(body: Partial<Playlist>): Promise<Playlist> {
    const res = await this.http.patch("/playlist", body)
    return res.data
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/playlist/${id}`)
  }

  async addOrRemove(body: {
    playlistId: string
    episodeId?: string
    mediaRefId?: string
  }): Promise<Playlist> {
    const res = await this.http.patch("/playlist/add-or-remove", body)
    return res.data
  }

  async toggleSubscribe(id: string): Promise<void> {
    await this.http.get(`/playlist/toggle-subscribe/${id}`)
  }
}
