import { AxiosInstance } from "axios"

import { BaseClient } from "../baseClient"
import { flattenNodes, TuneInBrowseResponse, TuneInNode } from "./flattenTuneIn"
import {
  TuneInResponse,
  TuneInShowDetail,
  TuneInShowDetailResponse,
  TuneInStationDetail,
  TuneInStationDetailResponse,
  TuneInWebClientOptions,
} from "./types"

// ────────────────────────────────────────────────
// MAIN CLIENT (merged API)
// ────────────────────────────────────────────────

export class TuneInWebClient extends BaseClient {
  private http: AxiosInstance

  constructor(opts: TuneInWebClientOptions = {}) {
    super({
      baseURL: opts.baseUrl ?? "https://opml.radiotime.com",
      timeout: 8000,
    })

    // Inject partnerId into all requests
    this.http.interceptors.request.use((config) => {
      config.params = config.params ?? {}
      config.params.partnerId = opts.partnerId ?? "none"
      config.params.render = "json"
      return config
    })
  }

  // ────────────────────────────────────────────────
  // SEARCH + DIRECTORY
  // ────────────────────────────────────────────────

  async search(query: string): Promise<TuneInNode[]> {
    const items: TuneInBrowseResponse | undefined = await this.safeGet(() =>
      this.http.get<TuneInBrowseResponse>("/Search.ashx", {
        params: { query },
      }),
    )

    if (items) return flattenNodes(items)

    return []
  }

  async browse(id: string): Promise<TuneInNode[]> {
    const items: TuneInBrowseResponse | undefined = await this.safeGet(() =>
      this.http.get<TuneInBrowseResponse>("/Browse.ashx", {
        params: { id },
      }),
    )

    if (items) return flattenNodes(items)

    return []
  }

  async getShow(id: string): Promise<TuneInShowDetail | undefined> {
    const item: TuneInShowDetailResponse | undefined = await this.safeGet(() =>
      this.http.get<TuneInShowDetailResponse>("/Describe.ashx", {
        params: { id },
      }),
    )

    if (item && item.body.length > 0) {
      return item.body[0] as TuneInShowDetail
    }
    return undefined
  }

  async getStation(id: string): Promise<TuneInStationDetail | undefined> {
    const item: TuneInStationDetailResponse | undefined = await this.safeGet(() =>
      this.http.get<TuneInStationDetailResponse>("/Describe.ashx", {
        params: { id },
      }),
    )

    if (item && item.body.length > 0) {
      return item.body[0] as TuneInStationDetail
    }
    return undefined
  }

  // ────────────────────────────────────────────────
  // TUNE (stream resolution entrypoint)
  // ────────────────────────────────────────────────

  async getStationUrl(id: string): Promise<string | undefined> {
    const item: any = await this.safeGet(() =>
      this.http.get<TuneInResponse>("/Tune.ashx", {
        params: { id },
      }),
    )

    if (item && item.body.length > 0) {
      return item.body[0].url
    }
    return undefined
  }
}
