import axios, { AxiosInstance } from "axios"

import type { TuneInDescribeItem, TuneInResponse, TuneInResponseItem, TuneInStation } from "./types"

export class TuneInWebClient {
  private http: AxiosInstance

  constructor() {
    this.http = axios.create({
      baseURL: "https://opml.radiotime.com",
      timeout: 10000,
      params: {
        render: "json",
        partnerId: "none",
      },
    })
  }

  // ────────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────────
  async search(keyword: string): Promise<TuneInStation[]> {
    const { data } = await this.http.get<TuneInResponse<TuneInResponseItem>>("/Search.ashx", {
      params: { query: keyword },
    })

    return this.extractStations(data)
  }

  // ────────────────────────────────────────────────
  // Browse by country
  // ────────────────────────────────────────────────
  async browseByCountry(countryCode: string): Promise<TuneInStation[]> {
    const { data } = await this.http.get<TuneInResponse<TuneInResponseItem>>("/Browse.ashx", {
      params: { id: countryCode },
    })

    return this.extractStations(data)
  }

  // ────────────────────────────────────────────────
  // Station lookup
  // ────────────────────────────────────────────────
  async getStation(id: string): Promise<TuneInStation | undefined> {
    const { data } = await this.http.get<TuneInResponse<TuneInDescribeItem>>("/Describe.ashx", {
      params: { id },
    })

    return this.extractStation(data)
  }

  // ────────────────────────────────────────────────
  // Playback URL
  // ────────────────────────────────────────────────
  async getPlaybackUrl(id: string): Promise<string | null> {
    const { data } = await this.http.get<any>("/Tune.ashx", {
      params: { id },
    })

    return data?.body?.[0]?.url ?? null
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private extractStation(data: TuneInResponse<TuneInDescribeItem>): TuneInStation | undefined {
    const src = data.body?.[0]
    if (!src) return undefined

    return {
      id: src.guide_id,
      text: src.text,
      subtext: src.subtext,
      url: src.URL,
      image: src.image || src.playing_image,
      bitrate: src.bitrate,
      reliability: src.reliability,
      playing: src.playing,
    }
  }

  private extractStations(data: TuneInResponse<TuneInResponseItem>): TuneInStation[] {
    const stations: TuneInStation[] = []

    const walk = (items: any[]) => {
      for (const item of items) {
        const id = item.guide_id || item.URL?.match(/id=(s\d+)/)?.[1]

        if (item.type === "audio" && id && item.URL) {
          stations.push({
            id,
            text: item.text,
            subtext: item.subtext,
            url: item.URL,
            image: item.image || item.logo,
            bitrate: item.bitrate,
            reliability: item.reliability,
            playing: item.playing,
          })
        }

        if (item.outline) walk(item.outline)
        if (item.children) walk(item.children)
      }
    }

    walk(data.body ?? [])
    return stations
  }
}
