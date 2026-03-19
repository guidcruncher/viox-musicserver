import Parser from "rss-parser"

import { getLogger } from "@/logger"

import { Episode, rfcToIso8601 } from "./types"

class RSSEpisodeParser {
  private parser: Parser

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ["itunes:image", "itunesImage"],
          ["itunes:duration", "itunesDuration"],
        ],
      },
    })
  }

  async parse(podcastId: string, url: string): Promise<Episode[]> {
    const logger = getLogger()
    logger.debug(`Parsing podcastId ${podcastId} - ${url}`)
    const feed = await this.parser.parseURL(url)
    const items = feed.items
      .map((item) => this.toEpisode(podcastId, item))
      .filter((e): e is Episode => e !== null)
    logger.debug(`Episodes parsed podcastId ${podcastId} - ${items.length}`)
    return items
  }

  private toEpisode(podcastId: string, item: any): Episode | null {
    const mediaUrl = item.enclosure?.url || item.enclosure?.link || item["media:content"]?.url

    if (!mediaUrl) {
      return null
    }

    return {
      id: `podverse:episode:${item.guid || item.id}`,
      podcast: { id: podcastId },
      title: item.title,
      description: item.contentSnippet || item.content || item.summary,
      imageUrl:
        item["itunes:image"]?.href || item.itunes?.image || item["media:thumbnail"]?.url || "",
      linkUrl: item.link,
      mediaUrl,
      pubDate: rfcToIso8601(item.pubDate),
      duration: this.parseDuration(item.itunesDuration),
    }
  }

  private parseDuration(raw: string | undefined): number | undefined {
    if (!raw) return 0

    // Formats supported:
    // "3600", "01:00:00", "12:34"
    if (/^\d+$/.test(raw)) {
      return parseInt(raw, 10)
    }

    const parts = raw.split(":").map((n) => parseInt(n, 10))
    if (parts.length === 3) {
      const [h, m, s] = parts
      return h * 3600 + m * 60 + s
    }
    if (parts.length === 2) {
      const [m, s] = parts
      return m * 60 + s
    }

    return 0
  }
}

export const RssEpisodeParser = new RSSEpisodeParser()
