export interface TuneInWebClientOptions {
  baseUrl?: string
  partnerId?: string
}

export interface TuneInItem {
  guide_id?: string
  text?: string
  subtext?: string
  image?: string
  URL?: string
  item?: string
}

export interface TuneInResponse {
  head?: Record<string, any>
  body: TuneInItem[]
}

export interface TuneInStationDetailResponse {
  head: {
    status: string
  }
  body: TuneInStationDetail[]
}

export interface TuneInStationDetail {
  guide_id: string
  preset_id: string

  name: string
  call_sign: string
  slogan: string

  frequency: string
  band: string

  url: string
  report_url: string
  detail_url: string

  is_preset: boolean
  is_available: boolean
  is_music: boolean
  has_song: boolean
  has_schedule: boolean
  has_topics: boolean

  twitter_id: string
  logo: string

  location: string

  description: string

  email: string
  phone: string
  mailing_address: string

  language: string

  genre_id: string
  genre_name: string

  country_region_id: number

  tz: string
  tz_offset: string

  ad_eligible: boolean
  preroll_ad_eligible: boolean
  companion_ad_eligible: boolean
  video_preroll_ad_eligible: boolean

  fb_share: boolean
  twitter_share: boolean
  song_share: boolean

  tunein_url: string

  is_family_content: boolean
  is_mature_content: boolean
  is_event: boolean

  content_classification: string

  has_profile: string

  can_cast: boolean

  nielsen_eligible: boolean

  use_native_player: boolean
  live_seek_stream: boolean
  seek_disabled: boolean
}

export interface TuneInShowDetailResponse {
  head: {
    status: string
  }
  body: TuneInShowDetail[]
}

export interface TuneInShowDetail {
  element: "show"

  title: string
  hosts: string

  guide_id: string
  preset_id: string

  description: string

  is_preset: boolean
  is_event: boolean

  url: string
  report_url: string
  detail_url: string

  twitter_id: string
  logo: string

  location: string

  has_topics: boolean

  email: string
  phone: string

  language: string

  start: string
  start_utc: string
  duration: string

  fb_share: boolean
  twitter_share: boolean
  ad_eligible: boolean

  tunein_url: string

  is_family_content: boolean
  is_mature_content: boolean

  has_profile: string
}
