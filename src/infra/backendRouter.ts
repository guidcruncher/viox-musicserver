import type { BackendRouter, MediaItem, PlaybackBackend } from "@/types"

export class SimpleBackendRouter implements BackendRouter {
  private readonly backends: Record<string, PlaybackBackend>
  private readonly fallback: PlaybackBackend

  constructor(backends: Record<string, PlaybackBackend>, fallback: PlaybackBackend) {
    this.backends = backends
    this.fallback = fallback
  }

  resolveBackendFor(item: MediaItem): PlaybackBackend {
    const source = item.sourceRef.source
    return this.backends[source] ?? this.fallback
  }
}
