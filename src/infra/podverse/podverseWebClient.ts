// infra/podverse/PodverseWebClient.ts
import { AxiosInstance } from "axios"

import { axiosFactory } from "@/infra/axiosFactory"
import { logger } from "@/logger"

import { RssEpisodeParser } from "./RssEpisodeParser"

export class PodverseWebClient {
  readonly http: AxiosInstance

  constructor(baseURL = "https://api.podverse.fm/api/v1", token?: string) {
    this.http = axiosFactory({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
  }

  setToken(token: string) {
    this.http.defaults.headers.Authorization = `Bearer ${token}`
  }

  // ────────────────────────────────────────────────
  // Podcasts
  // ────────────────────────────────────────────────
  async getPodcast(id: string) {
    return (await this.http.get(`/podcast/${id}`)).data
  }

  async searchPodcasts(query: string, offset: number, limit: number) {
    const page = offset / limit + 1
    const res = await this.http.get(`/podcast`, { params: { searchTitle: query, page: page } })

    return res.data[0]
  }

  async getPodcastsForCategory(categories: string[]) {
    return (
      await this.http.get(`/podcast`, {
        params: { categories: categories.join(",") },
      })
    ).data
  }

  // ────────────────────────────────────────────────
  // Episodes (with RSS fallback)
  // ────────────────────────────────────────────────
  async getEpisodesForPodcast(podcastId: string) {
    const res = await this.http.get("/episode", {
      params: {
        podcastId,
        includePodcast: true,
        sort: "pubDate",
      },
    })

    const episodes = res.data?.[0] ?? []

    if (episodes.length > 0) {
      return episodes
    }

    // Fallback to RSS
    const podcast = await this.getPodcast(podcastId)

    if (!podcast.feedUrls) return []

    let items: any[] | undefined

    for (let i = 0; i < podcast.feedUrls.length; i++) {
      items = await RssEpisodeParser.parse(podcastId, podcast.feedUrls[i].url)
      if (items) return items
    }

    return []
  }

  async getEpisode(id: string, podcastId?: string) {
    try {
      const episodeId = id.split(":").pop()
      return (await this.http.get(`/episode/${episodeId}`)).data
    } catch {
      try {
        // fallback: RSS lookup
        logger.warn("Falling back to RSS lookup")

        if (!podcastId) {
          logger.error(`Unable to resolve podCastId in getEpisode id ${id}`)
          return undefined
        }

        const podcast = await this.getPodcast(podcastId)
        const feedUrl = podcast.feedUrls?.[0]?.url

        if (!feedUrl) {
          logger.error(`No podcast FeedURL for podcastId ${podcastId}`)
          return undefined
        }

        const episodes = await RssEpisodeParser.parse(podcastId, feedUrl)
        if (!episodes) {
          logger.error(`Unable to parse RSS feed for podcastId ${podcastId} - ${feedUrl}`)
          return undefined
        }

        return episodes.find((e) => e.id.endsWith(id)) ?? null
      } catch (err) {
        logger.error(`Error in getEpisode`, err)
        return undefined
      }
    }
  }

  async getCategories(id?: string): Promise<{ id: string; slug: string; title: string }[]> {
    let res: any

    if (id) {
      res = await this.http.get(`/category`, {
        params: { id: id },
      })
    } else {
      res = await this.http.get(`/category`, {
        params: { topLevelCategories: true },
      })
    }

    if (id) {
      if (res.data[0][0].categories) {
        return res.data[0][0].categories.map((t: any) => {
          return { id: t.id, slug: t.slug, title: t.title }
        })
      }
    }

    return res.data[0].map((t: any) => {
      return { id: t.id, slug: t.slug, title: t.title }
    })
  }
}
