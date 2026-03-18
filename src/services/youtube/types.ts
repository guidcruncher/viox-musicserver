import { MediaItem } from "../../types/media-types"

export interface MatchResult {
  original: MediaItem
  bestMatch: any // Using any here because YTNodes are highly polymorphic
  score: number
}
