export interface TuneInStation {
  id: string
  text: string
  subtext?: string
  url: string
  image?: string
  bitrate?: number
  reliability?: number
  playing?: string
}

export interface TuneInDescribeItem {
  element: string
  type: string
  text: string
  URL: string
  subtext?: string
  image?: string
  bitrate?: number
  reliability?: number
  playing?: string
  playing_image?: string
  guide_id: string // This corresponds to your 'id' (e.g., "s323600")
  formats?: string
  item?: string
}

export interface TuneInResponseItem {
  // Core Identity
  text: string
  URL?: string // The API endpoint to 'Tune' or 'Browse' further
  key?: string // Unique identifier for categories (e.g., 'stations')
  guide_id?: string // The unique ID for the station (e.g., 's12345')

  // Content Metadata
  type?: "audio" | "link" | "text" | "container"
  item?: "station" | "show" | "topic" | "category"
  subtext?: string // Usually the current song or slogan
  genre_id?: string
  language?: string

  // Media & Technical
  image?: string // Station logo/thumbnail
  logo?: string // Alternative field for logo
  bitrate?: number
  formats?: string // e.g., "mp3,wma,aac"
  reliability?: number // 0-100 score of stream uptime

  // Geographic / Contextual
  callsign?: string
  location?: string
  playing?: string // Current artist/track name
  playing_image?: string

  // Nesting
  children?: TuneInResponseItem[]
  outline?: TuneInResponseItem[]
}

export interface TuneInResponse<T> {
  head: {
    status: string
    title?: string
    fault?: string
  }
  body: T[]
}
