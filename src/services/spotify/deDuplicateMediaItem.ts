import { MediaItem } from "../../types/media-types"

export function dedupeMediaItemsByUri(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>()
  const result: MediaItem[] = []

  for (const item of items) {
    if (!item.uri) continue // uri is required, but guard anyway

    if (!seen.has(item.uri)) {
      seen.add(item.uri)
      result.push(item)
    }
  }

  return result
}
