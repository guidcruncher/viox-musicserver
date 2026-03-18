export type AudioSource = "spotify" | "podverse" | "radiobrowser" | "tunein" | "youtube" | "local"

export type AudioSourceItemType = "track" | "album" | "episode" | "show" | "podcast" | "station"

export interface MediaSourceRef {
  source: AudioSource
  itemType: AudioSourceItemType
  sourceId: string
  parentSourceId?: string
  uri?: string
}
