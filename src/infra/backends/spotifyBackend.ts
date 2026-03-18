import { BasePlaybackBackend } from "@/core/playbackBackendBase";
import type { MediaItem } from "@/types";

export class SpotifyPlaybackBackend extends BasePlaybackBackend {
  readonly id = "spotify";

  // TODO: Inject Spotify SDK client
  constructor(/* spotifyClient */) {
    super();
  }

  async play(item: MediaItem, positionMs?: number): Promise<void> {
    // TODO: call Spotify SDK
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
    return 0;
  }
}
