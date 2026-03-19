import type { MediaItem, PlaybackBackend } from "@/types"

export abstract class BasePlaybackBackend implements PlaybackBackend {
  abstract readonly id: string

  abstract play(item: MediaItem, positionMs?: number): Promise<void>
  abstract pause(): Promise<void>
  abstract stop(): Promise<void>
  abstract seek(positionMs: number): Promise<void>
  abstract getPosition(): Promise<number>
}
