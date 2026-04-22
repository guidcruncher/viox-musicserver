type VioxEventType =
  | "track_start"
  | "track_pause"
  | "track_resume"
  | "track_stop"
  | "track_change"
  | "seek"
  | "volume_change"
  | "shuffle_change"
  | "repeat_change"
  | "raw"
  | "metadata"
  | "active"
  | "inactive"
  | "finished"
  | "time-update"

export interface VioxEvent {
  type: VioxEventType
  payload: any
}

export interface VioxEventWrapper {
  event: VioxEvent
}

export interface VioxCommand {
  command: string
  params?: string[]
  request_id: string
}

export interface VioxCommandResponse {
  request_id: string
  error: string
  data: any
}

export interface VioxCommandError {
  request_id: string
  error: string
}
