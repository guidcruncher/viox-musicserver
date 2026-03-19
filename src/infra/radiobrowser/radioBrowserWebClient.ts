import axios, { AxiosInstance } from "axios";

export class RadioBrowserWebClient {
  private http: AxiosInstance;

  constructor(baseURL = "https://de1.api.radio-browser.info") {
    this.http = axios.create({
      baseURL,
      headers: {
        "User-Agent": "VIOX/1.0",
        Accept: "application/json",
      },
    });
  }

  // ────────────────────────────────────────────────
  // Search
  // ────────────────────────────────────────────────
  async search(params: {
    name?: string;
    countrycode?: string;
    limit?: number;
    offset?: number;
    hidebroken?: boolean;
  }): Promise<any[]> {
    const { data } = await this.http.get("/json/stations/search", {
      params,
    });
    return data;
  }

  // ────────────────────────────────────────────────
  // Station lookup
  // ────────────────────────────────────────────────
  async getStation(id: string): Promise<any | undefined> {
    const { data } = await this.http.get(`/json/stations/byuuid/${id}`);
    return data?.[0];
  }

  // ────────────────────────────────────────────────
  // Countries
  // ────────────────────────────────────────────────
  async getCountries(): Promise<Array<{ code: string; name: string }>> {
    const { data } = await this.http.get("/json/countries");

    return data
      .map((c: any) => ({
        code: c.iso_3166_1,
        name: c.name,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
}
