type VioxEventType =
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

export interface VioxEvent {
  type: VioxEventType
  payload: any
}
