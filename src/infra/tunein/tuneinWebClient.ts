import axios, { AxiosInstance } from "axios"
import { BaseClient } from "../baseClient"
import { TuneInWebClientOptions, TuneInItem, TuneInResponse } from "./types"

// ────────────────────────────────────────────────
// MAIN CLIENT (merged API)
// ────────────────────────────────────────────────

export class TuneInWebClient extends BaseClient {
  private http2: AxiosInstance

  constructor(opts: TuneInWebClientOptions = {}) {
    super({
      baseURL: opts.baseUrl ?? "https://opml.radiotime.com",
      timeout: 8000,
    })

    // Inject partnerId into all requests
    this.http.interceptors.request.use((config) => {
      config.params = config.params ?? {}
      config.params.partnerId = opts.partnerId ?? "none"
      return config
    })

    // Secondary instance (mirrors Spotify librespot pattern)
    this.http2 = axios.create({
      baseURL: opts.baseUrl ?? "https://opml.radiotime.com",
      timeout: 8000,
    })

    this.http2.interceptors.request.use((config) => {
      config.params = config.params ?? {}
      config.params.partnerId = opts.partnerId ?? "none"
      return config
    })
  }

  // ────────────────────────────────────────────────
  // SEARCH + DIRECTORY
  // ────────────────────────────────────────────────

  search(query: string) {
    return this.safeGet(() =>
      this.http2.get<TuneInResponse>("/Search.ashx", {
        params: { query, render: "json" },
      }),
    )
  }

  browse(id: string) {
    return this.safeGet(() =>
      this.http2.get<TuneInResponse>("/Browse.ashx", {
        params: { id, render: "json" },
      }),
    )
  }

  describe(id: string) {
    return this.safeGet(() =>
      this.http2.get<TuneInResponse>("/Describe.ashx", {
        params: { id, render: "json" },
      }),
    )
  }

  // ────────────────────────────────────────────────
  // TUNE (stream resolution entrypoint)
  // ────────────────────────────────────────────────

  tuneStation(id: string) {
    return this.safeGet(() =>
      this.http.get<TuneInResponse>("/Tune.ashx", {
        params: { id, render: "json" },
      }),
    )
  }
}

