import { AxiosInstance } from "axios"

import { getLogger } from "../../logger"
import { extractId } from "../idParser"
import { Podcast } from "./types"

export class PodcastService {
  constructor(private http: AxiosInstance) {}

  async getPodcasts(opt?: {
    categories?: string
    podcastId?: string
    searchAuthor?: string
    searchTitle?: string
    page?: number
  }): Promise<Podcast[]> {
    const params: any = opt
    params.sort = "title"
    const res = await this.http.get("/podcast", { params })
    if (res.data) {
      if (res.data.length > 0) {
        return res.data[0]
      }
    }
    return []
  }

  async getPodcastById(id: string): Promise<Podcast> {
    const logger = getLogger()
    logger.debug(`getpodCastById ${id}`)
    const res = await this.http.get(`/podcast/${extractId(id)}`)
    return res.data
  }

  async getMetadata(podcastId: string): Promise<Podcast[]> {
    const res = await this.http.get("/podcast/metadata", {
      params: { podcastId: extractId(podcastId) },
    })
    return res.data
  }

  async toggleSubscribe(id: string): Promise<void> {
    await this.http.get(`/podcast/toggle-subscribe/${extractId(id)}`)
  }
}
