// infra/tunein/TuneInWebClient.ts
import { BaseClient } from "../baseClient"
import type {
  TuneInDescribeItem,
  TuneInResponse,
  TuneInResponseItem,
  TuneInStation,
} from "./types"

export class TuneInWebClient extends BaseClient {
  constructor() {
    super({
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
  search(keyword: string): Promise<TuneInStation[]> {
    return this.safeGet<TuneInResponse<TuneInResponseItem>>(() =>
      this.http.get("/Search.ashx", {
        params: { query: keyword },
      }),
    ).then((data) => this.extractStations(data))
  }

  // ────────────────────────────────────────────────
  // Browse by country
  // ────────────────────────────────────────────────
  browseByCountry(countryCode: string): Promise<TuneInStation[]> {
    return this.safeGet<TuneInResponse<TuneInResponseItem>>(() =>
      this.http.get("/Browse.ashx", {
        params: { id: countryCode },
      }),
    ).then((data) => this.extractStations(data))
  }

  // ────────────────────────────────────────────────
  // Station lookup
  // ────────────────────────────────────────────────
  getStation(id: string): Promise<TuneInStation | undefined> {
    return this.safeGet<TuneInResponse<TuneInDescribeItem>>(() =>
      this.http.get("/Describe.ashx", {
        params: { id },
      }),
    ).then((data) => this.extractStation(data))
  }

  // ────────────────────────────────────────────────
  // Playback URL
  // ────────────────────────────────────────────────
  getPlaybackUrl(id: string): Promise<string | null> {
    return this.safeGet<any>(() =>
      this.http.get("/Tune.ashx", {
        params: { id },
      }),
    ).then((data) => data?.body?.[0]?.url ?? null)
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private extractStation(
    data: TuneInResponse<TuneInDescribeItem> | undefined,
  ): TuneInStation | undefined {
if (!data) return undefined

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

  private extractStations(
    data: TuneInResponse<TuneInResponseItem> | undefined,
  ): TuneInStation[] {
if (!data) return []

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

