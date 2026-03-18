import { YTNodes } from "youtubei.js"

import { getLogger } from "../../../logger"
import { UnifiedSearchResult } from "../types"
import { BackendSearchClient } from "./types"
import { getYoutubeClient } from "./ytClient"

export const youtubeMusicSearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    const logger = getLogger()

    try {
      const yt = await getYoutubeClient()
      // Using the music-specific search
      const search = await yt.music.search(query)

      const items: UnifiedSearchResult[] = []

      // Navigate to the music shelves
      const shelves = search.contents?.filterType(YTNodes.MusicShelf) || []
      const allResults = shelves.flatMap((shelf: any) => shelf.contents || [])

      for (const item of allResults) {
        if (items.length >= limit) break

        // --- RESTRICTION & PLAYABILITY FILTERS ---

        // 1. Skip items explicitly flagged as unplayable or upcoming
        if ((item as any).unplayable || (item as any).upcoming) {
          continue
        }

        // 2. Safe Overlay Check: Catch "Unavailable" items
        // item.overlay is typically a MusicItemThumbnailOverlay node
        const overlay = (item as any).overlay
        if (overlay?.content?.toString().toLowerCase().includes("unavailable")) {
          continue
        }

        // --- DATA EXTRACTION & MAPPING ---

        const id = (item as any).id || (item as any).video_id
        const title = item.title?.toString() || ""

        // Skip if there is no valid ID (prevents broken UI elements from being mapped)
        if (!id) continue

        let type = "track"
        let artist = ""
        let album: string | undefined = undefined
        let duration = 0

        // Cast to MusicResponsiveListItem for specific property access
        if (item.type === "MusicResponsiveListItem") {
          const musicItem = item as YTNodes.MusicResponsiveListItem

          artist =
            musicItem.author?.name || musicItem.artists?.map((a: any) => a.name).join(", ") || ""

          album = musicItem.album?.name || undefined
          duration = musicItem.duration?.seconds || 0

          // Align internal types with your existing UnifiedSearchResult types
          const itemType = musicItem.item_type
          if (itemType === "video") type = "video"
          else if (itemType === "album") type = "album"
          else if (itemType === "artist") type = "artist"
          else if (itemType === "playlist") type = "playlist"
          else if (itemType === "song") type = "track"
          else type = "track"
        }

        const thumbnails = (item as any).thumbnails || (item as any).thumbnail?.contents || []
        const bestThumb =
          thumbnails.length > 0
            ? thumbnails.reduce((prev: any, curr: any) => (prev.width > curr.width ? prev : curr))
                .url
            : undefined

        items.push({
          id: `youtube:${type}:${id}`,
          uri: `youtube:${type}:${id}`,
          backend: "youtube",
          type: type as any,
          title: title,
          format: "youtube",
          artist,
          album,
          duration,
          artworkUrl: bestThumb,
          meta: {
            titleMatch: title.toLowerCase().includes(query.toLowerCase()),
            popularity: 0,
            isExplicit: !!(item as any).is_explicit,
          },
        })
      }

      return items
    } catch (err) {
      // Retaining original logging exactly as requested
      logger.error(`Error searching YouTube Music`, err)
      return []
    }
  },
}
