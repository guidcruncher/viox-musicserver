type Backend = "spotify" | "mpd" | "snapserver"

type UnifiedEventType =
  | "track_start"
  | "track_pause"
  | "track_stop"
  | "track_change"
  | "seek"
  | "volume_change"
  | "shuffle_change"
  | "repeat_change"
  | "raw"
  | "metadata"

interface UnifiedEventBase {
  backend: Backend
  type: UnifiedEventType
}

export interface UnifiedEvent extends UnifiedEventBase {
  // backend-specific payload, but unified where possible
  raw: any
  [key: string]: any
}
