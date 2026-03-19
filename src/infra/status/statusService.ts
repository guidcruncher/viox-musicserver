// src/infra/status/statusService.ts
import type { BackendRegistry } from "@/infra/backends/backendRegistry"
import type { PlaybackController } from "@/infra/playback/playbackController"

export class StatusService {
  constructor(
    private readonly registry: BackendRegistry,
    private readonly playback: PlaybackController,
  ) {}

  async get() {
    const current = this.playback.getCurrentItem()
    const backends = this.registry.list()

    return {
      playing: !!current,
      currentItem: current ?? null,
      backends,
    }
  }
}
