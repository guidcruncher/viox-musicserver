// infra/radio/RadioBrowserWebClient.ts
import { BaseClient } from "../baseClient"
import { RadioBrowserDnsResolver } from "./radioBrowserDnsResolver"

export class RadioBrowserWebClient extends BaseClient {
  private resolver = new RadioBrowserDnsResolver()

  constructor() {
    super({
      baseURL: "https://de1.api.radio-browser.info", // temporary until DNS resolves
      headers: {
        "User-Agent": "VIOX/1.0",
        Accept: "application/json",
      },
    })

    this.initialize()
  }

  private async initialize() {
    const server = await this.resolver.pickServer()
    this.http.defaults.baseURL = server
  }

  // ────────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────────
  search(params: { name?: string; countrycode?: string; limit?: number; offset?: number }) {
    const page = (params.offset ?? 0) / (params.limit ?? 20) + 1
    const p = { ...params, page: page, hidebroken: true, reverse: false, order: "name" }
    return this.safeGet<any[]>(() => this.http.get("/json/stations/search", { params: p }))
  }

  // ────────────────────────────────────────────────
  // Station lookup
  // ────────────────────────────────────────────────
  async getStation(id: string) {
    const stations = await this.safeGet<any[]>(() => this.http.get(`/json/stations/byuuid/${id}`))

    return stations?.[0]
  }

  // ────────────────────────────────────────────────
  // Countries
  // ────────────────────────────────────────────────
  async getCountries(): Promise<Array<{ code: string; name: string }>> {
    const countries = await this.safeGet<any[]>(() => this.http.get("/json/countries"))

    if (!countries) return []

    return countries
      .map((c) => ({
        code: c.iso_3166_1,
        name: c.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
