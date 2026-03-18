// radiobrowser.client.ts
import axios, { AxiosInstance } from "axios"
import dns from "dns"
import util from "util"

import { getLogger } from "../../logger"

interface RadioBrowserSearchParams {
  name?: string
  countrycode?: string
  limit?: number
  offset?: number
  hidebroken?: boolean
}

const resolveSrv = util.promisify(dns.resolveSrv)

export class RadioBrowserClient {
  private http: AxiosInstance
  private baseUrl?: string = undefined
  private logger: any

  constructor(private userAgent: string = "MyMediaApp/1.0") {
    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json",
      },
    })
    this.logger = getLogger()
  }

  /**
   * Server discovery to avoid overloading a single mirror.
   */
  public async discoverServer(): Promise<void> {
    try {
      const { data } = await axios.get("https://all.api.radio-browser.info/json/servers")
      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)]
        this.baseUrl = `https://${random.name}`
        this.logger.info(`Selecting RadioBrowser ${this.baseUrl}`)
        this.http.defaults.baseURL = this.baseUrl
      }
    } catch (e) {
      this.logger.warn("Server discovery failed, using default.", e)
    }
  }

  async getBaseUrlsFromDns(): Promise<string[]> {
    try {
      this.logger.info("Querying DNS for Radiobrowsers")
      const hosts = await resolveSrv("_api._tcp.radio-browser.info")
      hosts.sort()
      const names = hosts.map((host) => "https://" + host.name)
      this.logger.info(`Resolved Radiobrowsers ${names.join(", ")}`)
      return names
    } catch (err) {
      this.logger.error("Error running getBaseUrlsFromDns", err)
      return []
    }
  }

  public async discoverServerFromDns(): Promise<string | undefined> {
    try {
      const hosts = await this.getBaseUrlsFromDns()
      if (hosts.length <= 0) {
        this.logger.error("Error running discoverServerFromDns, no hosts returned from DNS")
        return undefined
      }
      const item = hosts[Math.floor(Math.random() * hosts.length)]
      this.baseUrl = item
      this.logger.info(`Selecting RadioBrowser from DNS ${this.baseUrl}`)
      this.http.defaults.baseURL = this.baseUrl
      return item
    } catch (err) {
      this.logger.error("Error running discoverServerFromDns", err)
      return undefined
    }
  }

  async search(params: RadioBrowserSearchParams): Promise<any[]> {
    const { data } = await this.http.get<any[]>("/json/stations/search", {
      params,
    })
    return data
  }

  async getStation(id: string): Promise<any> {
    try {
      const { data } = await this.http.get<any[]>(`/json/stations/byuuid/${id}`)
      return data[0]
    } catch (err) {
      this.logger.error("Error running getStation uuid: ${uuid}", err)
      return undefined
    }
  }

  async getCountries(): Promise<Array<{ code: string; name: string }>> {
    const { data } = await this.http.get<any[]>("/json/countries")

    return data
      .map((c) => ({
        code: c.iso_3166_1,
        name: c.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
}
