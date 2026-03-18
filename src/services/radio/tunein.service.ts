// tunein.api.ts
import axios from "axios"

import { getLogger } from "../../logger"
import { tuneInRepository } from "../../repositories/tuneinRepository"
import { TuneInDescribeItem, TuneInResponse, TuneInResponseItem, TuneInStation } from "./types"

export class TuneInService {
  private logger = getLogger()

  private http = axios.create({
    baseURL: "https://opml.radiotime.com",
    timeout: 10_000,
    params: {
      render: "json",
      partnerId: "none",
    },
  })

  private extractStation(data: TuneInResponse<TuneInDescribeItem>): TuneInStation | undefined {
    if (!data || !data.body) return undefined
    const source = data.body[0]

    const res = {
      id: source.guide_id,
      text: source.text,
      subtext: source.subtext,
      url: source.URL,
      image: source.image || source.playing_image,
      bitrate: source.bitrate,
      reliability: source.reliability,
      playing: source.playing,
    }
    return res
  }

  private extractStations(data: TuneInResponse<TuneInResponseItem>): TuneInStation[] {
    const stations: TuneInStation[] = []
    // Helper to recursively walk the nested "outline" or "children" arrays
    const traverse = (items: any[]) => {
      for (const item of items) {
        // 1. Check if this specific item is a station (has an ID and is audio type)
        // Note: Some search results use 'guide_id', others might just have it in the URL
        const id = item.guide_id || item.URL?.match(/id=(s\d+)/)?.[1]

        if (item.type === "audio" && id && item.URL) {
          stations.push({
            id: id,
            text: item.text,
            subtext: item.subtext,
            url: item.URL,
            // The API sometimes uses 'image', sometimes 'logo'
            image: item.image || item.logo,
            bitrate: item.bitrate ? Number(item.bitrate) : undefined,
            reliability: item.reliability ? Number(item.reliability) : undefined,
            playing: item.playing,
          })
        }

        // 2. Recurse if there are nested children
        if (item.outline && Array.isArray(item.outline)) {
          traverse(item.outline)
        } else if (item.children && Array.isArray(item.children)) {
          traverse(item.children)
        }
      }
    }

    // The root of the response is almost always in the 'body' property
    if (data?.body && Array.isArray(data.body)) {
      traverse(data.body)
    }

    return stations
  }

  async search(keyword: string): Promise<TuneInStation[]> {
    try {
      let data = undefined

      data = (
        await this.http.get<TuneInResponse<TuneInResponseItem>>("/Search.ashx", {
          params: { query: keyword },
        })
      ).data

      return this.extractStations(data)
    } catch (err) {
      this.logger.error("Error running search", err)
      return []
    }
  }

  async browseByCountry(countryCode: string): Promise<TuneInStation[]> {
    try {
      this.logger.debug(`Browse by country ${countryCode}`)
      const { data } = await this.http.get<TuneInResponse<TuneInResponseItem>>("/Browse.ashx", {
        params: { id: countryCode },
      })

      return this.extractStations(data)
    } catch (err) {
      this.logger.error("Error running search by country", err)
      return []
    }
  }

  async getCountries(): Promise<Array<{ code: string; name: string }>> {
    try {
      return await tuneInRepository.getRegions()
    } catch (err) {
      this.logger.error("Error running get countries", err)
      return []
    }
  }

  async getStation(id: string): Promise<TuneInStation | undefined> {
    try {
      const { data } = await this.http.get<TuneInResponse<TuneInDescribeItem>>("/Describe.ashx", {
        params: { id: id },
      })

      const station = this.extractStation(data)
      return station
    } catch (err) {
      this.logger.error("Error running get station", err)
      return undefined
    }
  }

  async getPlaybackUrl(id: string): Promise<string> {
    try {
      const { data } = await this.http.get<any>("/Tune.ashx", {
        params: { id: id },
      })

      if (!data) {
        this.logger.error(`Stream ${id} not found on TuneIn`)
        return ""
      }

      const url = data.body[0].url
      this.logger.debug(`URL for ${id} resolved on TuneIn to ${url}`)
      return url
    } catch (err) {
      this.logger.error("Error running get Playback URL", err)
      return ""
    }
  }
}
