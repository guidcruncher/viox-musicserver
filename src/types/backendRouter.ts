import { MediaItem, PlaybackBackend } from "./index"

export interface BackendRouter {
  resolveBackendFor(item: MediaItem): PlaybackBackend | undefined
}
