import { MediaItem } from "./index"

export interface MediaItemNormalizer {
  normalize(raw: any): MediaItem
}
