import { AxiosInstance } from "axios"

import { MediaRef, Playlist, User } from "./types"

export class UserService {
  constructor(private http: AxiosInstance) {}

  async getUsers(userIds: string[]): Promise<User[]> {
    const res = await this.http.get("/user", {
      params: { userIds: userIds.join(",") },
    })
    return res.data
  }

  async getById(id: string): Promise<User> {
    const res = await this.http.get(`/user/${id}`)
    return res.data
  }

  async getMediaRefs(): Promise<MediaRef[]> {
    const res = await this.http.get("/user/mediaRefs")
    return res.data
  }

  async getPlaylists(): Promise<Playlist[]> {
    const res = await this.http.get("/user/playlists")
    return res.data
  }

  async update(body: Partial<User>): Promise<User> {
    const res = await this.http.patch("/user", body)
    return res.data
  }

  async delete(): Promise<void> {
    await this.http.delete("/user")
  }
}
