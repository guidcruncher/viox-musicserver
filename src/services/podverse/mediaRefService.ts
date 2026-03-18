import { AxiosInstance } from "axios"

import { MediaRef } from "./types"

export class MediaRefService {
  constructor(private http: AxiosInstance) {}

  async getMediaRefs(params?: any): Promise<MediaRef[]> {
    const res = await this.http.get("/mediaRef", { params })
    return res.data
  }

  async getById(id: string): Promise<MediaRef> {
    const res = await this.http.get(`/mediaRef/${id}`)
    return res.data
  }

  async create(body: Partial<MediaRef>): Promise<MediaRef> {
    const res = await this.http.post("/mediaRef", body)
    return res.data
  }

  async update(body: Partial<MediaRef>): Promise<MediaRef> {
    const res = await this.http.patch("/mediaRef", body)
    return res.data
  }

  async delete(id: string): Promise<void> {
    await this.http.delete(`/mediaRef/${id}`)
  }
}
