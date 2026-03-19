import axios, { AxiosInstance } from "axios";
import { RadioBrowserDnsResolver } from "./RadioBrowserDnsResolver";

export class RadioBrowserWebClient {
  private http: AxiosInstance;
  private resolver = new RadioBrowserDnsResolver();

  constructor() {
    this.http = axios.create({
      baseURL: "https://de1.api.radio-browser.info", // temporary until DNS resolves
      headers: {
        "User-Agent": "VIOX/1.0",
        Accept: "application/json",
      },
    });

    this.initialize();
  }

  private async initialize() {
    const server = await this.resolver.pickServer();
    this.http.defaults.baseURL = server;
  }

  async search(params: {
    name?: string;
    countrycode?: string;
    limit?: number;
    offset?: number;
    hidebroken?: boolean;
  }): Promise<any[]> {
    const { data } = await this.http.get("/json/stations/search", { params });
    return data;
  }

  async getStation(id: string): Promise<any | undefined> {
    const { data } = await this.http.get(`/json/stations/byuuid/${id}`);
    return data?.[0];
  }

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
