import compareTwoStrings from "string-similarity-js"
import { Innertube, YTNodes } from "youtubei.js"

import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { getInnertube } from "./innertube"
import { MatchResult } from "./types"

type MatchProgressCallback = (success: boolean) => void

export class YouTubeMusicMatcher {
  private yt?: Innertube
  private logger: any

  constructor() {
    this.logger = getLogger()
  }

  private async getClient(): Promise<Innertube> {
    if (!this.yt) {
      this.yt = await getInnertube()
    }
    return this.yt
  }

  async matchItems(
    items: MediaItem[],
    progress?: MatchProgressCallback,
    concurrency = 5,
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = []
    let index = 0

    await this.getClient()

    const worker = async () => {
      while (index < items.length) {
        const current = index++
        const item = items[current]

        try {
          if (item.type !== "playlist") {
            const result = await this.matchSingle(item, progress)
            if (result) results[current] = result
          }
        } catch (err) {
          this.logger.error(`Match failed for ${item.title}`, err)
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()))
    return results.filter(Boolean)
  }

  async matchSingle(
    item: MediaItem,
    progress?: MatchProgressCallback,
  ): Promise<MatchResult | undefined> {
    try {
      const client = await this.getClient()
      const query = [item.title, item.artist].filter(Boolean).join(" ")

      const search = await client.music.search(query, { type: "song" })

      const shelf = search.contents?.firstOfType(YTNodes.MusicShelf)
      const results = shelf?.contents || []

      const best = this.findBestMatch(item, results)

      if (progress) progress(true)

      return {
        original: item,
        bestMatch: best?.item ?? null,
        score: best?.score ?? 0,
      }
    } catch (err: any) {
      this.logger.error(`Search error: ${err.message}`)
      if (progress) progress(false)
      return undefined
    }
  }

  private findBestMatch(item: MediaItem, results: any[]) {
    let best: { item: any; score: number } | null = null

    const targetTitle = (item.title ?? "").toLowerCase()
    const targetArtist = (item.artist ?? "").toLowerCase()

    for (const r of results) {
      const title = (r.title?.toString() || "").toLowerCase()
      const artist = (r.author?.name || r.artists?.[0]?.name || "").toLowerCase()

      const titleScore = compareTwoStrings(targetTitle, title)
      const artistScore = compareTwoStrings(targetArtist, artist)

      const score = titleScore * 0.7 + artistScore * 0.3

      if (!best || score > best.score) {
        best = { item: r, score }
      }
    }

    return best
  }
}
