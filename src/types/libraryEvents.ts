import { MediaItem } from "./index"

export interface LibraryEvents {
  onItemAdded?: (item: MediaItem) => void
  onItemUpdated?: (item: MediaItem) => void
  onItemRemoved?: (id: string) => void
}
