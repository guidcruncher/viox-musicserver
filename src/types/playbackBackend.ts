import { MediaItem } from "./mediaItem"

export interface PlaybackBackend {
  readonly id: string

  play(item: MediaItem, positionMs?: number): Promise<void>
  pause(): Promise<void>
  stop(): Promise<void>
  seek(positionMs: number): Promise<void>

  getPosition(): Promise<number> // ms
}
