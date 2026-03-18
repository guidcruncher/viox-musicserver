// radiobrowser.provider.ts
import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { extractId } from "../idParser"
import { mapRadioBrowserStation } from "./radiobrowser.mapper"
import { RadioBrowserClient } from "./radiobrowser.service"
import { RadioProvider } from "./radioProvider"

class RadioBrowserProvider implements RadioProvider {
  readonly name = "RadioBrowser"

  constructor(private client: RadioBrowserClient) {}

  async getStation(id: string): Promise<MediaItem | undefined> {
    const data = await this.client.getStation(extractId(id))
    if (!data) return undefined
    return mapRadioBrowserStation(data)
  }

  async search(keyword: string, opts?: { country?: string; offset?: number; limit?: number }) {
    const stations = await this.client.search({
      name: keyword,
      countrycode: opts?.country,
      offset: opts?.offset,
      limit: opts?.limit,
      hidebroken: true,
    })

    return stations.map(mapRadioBrowserStation)
  }

  async getCountries() {
    return this.client.getCountries()
  }

  async resolvePlaybackUrl(item: MediaItem) {
    return item.uri!
  }
}

export const radioBrowserProvider = async (): Promise<RadioProvider | undefined> => {
  const client = new RadioBrowserClient("MyMediaApp/1.0")

  try {
    await client.discoverServerFromDns()
    return new RadioBrowserProvider(client)
  } catch (err) {
    const logger = getLogger()
    logger.error("Error retrieving Radio Browser Provider", err)
    return undefined
  }
}
