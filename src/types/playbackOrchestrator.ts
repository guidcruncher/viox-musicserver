import { MediaItem, PlaybackState } from "./index"

export interface PlaybackOrchestrator {
  load(item: MediaItem): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seek(positionMs: number): Promise<void>;

  next(): Promise<void>;
  previous(): Promise<void>;

  getState(): PlaybackState;
}
