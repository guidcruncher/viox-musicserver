import type { BackendRouter, MediaItem, PlaybackBackend } from "@/types"

export class SimpleBackendRouter implements BackendRouter {
  constructor(
    private readonly spotifyBackend: PlaybackBackend,
    private readonly mpdBackend: PlaybackBackend,
    private readonly otherBackend: PlaybackBackend,
  ) {}

  resolveBackendFor(item: MediaItem): PlaybackBackend {
    switch (item.sourceRef.source) {
      case "spotify":
        return this.spotifyBackend
      case "local":
        return this.mpdBackend
      default:
        return this.otherBackend
    }
  }
}
