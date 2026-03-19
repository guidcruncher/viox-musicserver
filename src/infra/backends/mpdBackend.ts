import { BasePlaybackBackend } from "@/core/playbackBackendBase"
import type { MediaItem } from "@/types"

export class MPDPlaybackBackend extends BasePlaybackBackend {
  readonly id = "mpd"

  // TODO: Inject MPD client
  constructor(/* mpdClient */) {
    super()
  }

  async play(item: MediaItem, positionMs?: number): Promise<void> {
    // TODO
  }

  async pause(): Promise<void> {
    // TODO
  }

  async stop(): Promise<void> {
    // TODO
  }

  async seek(positionMs: number): Promise<void> {
    // TODO
  }

  async getPosition(): Promise<number> {
    // TODO
    return 0
  }
}
