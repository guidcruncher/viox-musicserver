import type { BackendRouter, MediaItem, PlaybackBackend } from "@/types"

export class SimpleBackendRouter implements BackendRouter {
  private readonly backends: Record<string, PlaybackBackend>

  constructor(backends: Record<string, PlaybackBackend>) {
    this.backends = backends
  }

  resolveBackendFor(item: MediaItem): PlaybackBackend | undefined {
    const source = item.sourceRef.source
    return this.backends[source] ?? undefined
  }
}
