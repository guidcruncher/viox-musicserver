import { BasePlaybackBackend } from "@/core/playbackBackendBase"
import type { MediaItem } from "@/types"

export class OtherPlaybackBackend extends BasePlaybackBackend {
  readonly id = "other"

  async play(item: MediaItem, positionMs?: number): Promise<void> {
    // TODO: handle radio streams, YouTube, TuneIn, etc.
  }

  async pause(): Promise<void> {
    // TODO
  }

  async stop(): Promise<void> {
    // TODO
  }

  async seek(positionMs: number): Promise<void> {
    // TODO (may not be supported for live streams)
  }

  async getPosition(): Promise<number> {
    return 0
  }
}
