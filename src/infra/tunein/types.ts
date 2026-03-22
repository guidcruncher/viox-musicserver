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
