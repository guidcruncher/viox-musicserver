import { MediaItem, PlaybackError } from "./index"

export type PlaybackState =
  | { type: "idle" }
  | { type: "loading"; item: MediaItem }
  | { type: "playing"; item: MediaItem; positionMs: number }
  | { type: "paused"; item: MediaItem; positionMs: number }
  | { type: "ended"; item: MediaItem }
  | { type: "error"; error: PlaybackError };
