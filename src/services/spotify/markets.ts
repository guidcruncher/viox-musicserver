// src/services/spotify/markets.ts

import { AxiosInstance } from "axios"

export class MarketsApi {
  constructor(private http: AxiosInstance) {}

  async getAvailableMarkets() {
    const res = await this.http.get("/markets")
    return res.data
  }
}
