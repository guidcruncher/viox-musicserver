import { getLogger } from "../../logger"
import { migrationLibraryRepository } from "../../repositories/migrationLibraryRepository"
import type { MediaItem } from "../../types/media-types"
import { dedupeMediaItemsByUri } from "../spotify/deDuplicateMediaItem"
import { mapYoutubeItemToMediaItem } from "./mapYouTubeItemToMediaItem"
import { MatchResult } from "./types"

class MigrationWriter {
  save(items: MatchResult[]): number {
    const logger = getLogger()
    let count: number = 0
    logger.info(`Saving ${items.length} items to migration library`)
    migrationLibraryRepository.clear()

    const mediaItems = items
      .map((item) => {
        if (item && item.bestMatch) {
          return mapYoutubeItemToMediaItem(item)
        }
        return null
      })
      .filter((item): item is MediaItem => item !== null)

    const deduped = dedupeMediaItemsByUri(mediaItems)

    deduped.forEach((item: any) => {
      migrationLibraryRepository.add(item)
      count += 1
    })

    logger.info(`Saved ${count} items to migration library, deduplicated from ${mediaItems.length}`)
    return count
  }
}

export const migrationWriter = new MigrationWriter()
