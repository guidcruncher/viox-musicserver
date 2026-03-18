import { AxiosInstance } from "axios"

import { getLogger } from "../../logger"
import { extractId } from "../idParser"
import { PodcastService } from "./podcastService"
import { RssEpisodeParser } from "./RSSEpisodeParser"
import { Episode } from "./types"

export class EpisodeService {
  private podcastService: PodcastService

  constructor(private http: AxiosInstance) {
    this.podcastService = new PodcastService(http)
  }

  proxyUrl(id: string, url: string): string {
    return `http://127.0.0.1:8080/api/proxy/podcast?id=${encodeURIComponent(id)}&url=${encodeURIComponent(url)}`
  }

  async getEpisodesFromFeed(podcastId: string): Promise<Episode[]> {
    const logger = getLogger()
    const podcast = await this.podcastService.getPodcastById(extractId(podcastId))

    if (!podcast) {
      logger.error(`Podcast record not found for podcastId ${podcastId}`)
      return []
    }

    const feedUrl = podcast.feedUrls
      ? podcast.feedUrls.length > 0
        ? podcast.feedUrls[0].url
        : ""
      : ""

    if (feedUrl != "") {
      logger.debug(
        `No episodes found on Podverse, attempting to retrieve from RSS feed podcastId ${podcastId} - ${feedUrl}`,
      )
      const episodes = await RssEpisodeParser.parse(podcast.id, feedUrl)

      if (episodes && episodes.length > 0) {
        logger.debug(`Episodes retrieved from RSS feed podcastId ${podcastId} - ${episodes.length}`)
        return episodes
      }
    } else {
      logger.warn(`No feed URL found for podcastId ${podcastId}`)
    }

    logger.warn(`No episodes found on Podverse or RSS feed for podcastId ${podcastId}`)
    return []
  }

  async getEpisodes(params: {
    includePodcast?: boolean
    podcastId: string
    searchTitle?: string
    page?: number
    sort?: string
  }): Promise<Episode[]> {
    const logger = getLogger()
    const cfg = { ...params }
    cfg.podcastId = extractId(params.podcastId)
    const res = await this.http.get("/episode", { params: cfg })
    if (res.data) {
      logger.debug(
        `Episodes retrieved from Podverse podcastId ${params.podcastId} - ${res.data[0].length}`,
      )
      if (res.data[0].length > 0) {
        return res.data[0]
      }
    }

    logger.warn(`No episodes found on Podverse for podcastId ${params.podcastId}`)
    const podcast = await this.podcastService.getPodcastById(extractId(params.podcastId))

    if (!podcast) {
      logger.error(`Podcast record not found for podcastId ${params.podcastId}`)
      return []
    }

    const feedUrl = podcast.feedUrls
      ? podcast.feedUrls.length > 0
        ? podcast.feedUrls[0].url
        : ""
      : ""

    if (feedUrl != "") {
      logger.debug(
        `No episodes found on Podverse, attempting to retrieve from RSS feed podcastId ${params.podcastId} - ${feedUrl}`,
      )
      const episodes = await RssEpisodeParser.parse(podcast.id, feedUrl)

      if (episodes && episodes.length > 0) {
        logger.debug(
          `Episodes retrieved from RSS feed podcastId ${params.podcastId} - ${episodes.length}`,
        )
        return episodes
      }
    } else {
      logger.warn(`No feed URL found for podcastId ${params.podcastId}`)
    }

    logger.warn(`No episodes found on Podverse or RSS feed for podcastId ${params.podcastId}`)
    return []
  }

  async getEpisodeById(id: string): Promise<Episode | undefined> {
    const logger = getLogger()
    try {
      logger.debug(`Trying getPodcastById Id: ${id}`)
      const res = await this.http.get(`/episode/${extractId(id)}`)
      return res.data
    } catch (err) {
      logger.error(`error in getPodcastById `, err)
      return undefined
    }
  }
}
