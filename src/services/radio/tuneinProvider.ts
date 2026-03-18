// tunein.provider.ts
import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { extractId } from "../idParser"
import { RadioProvider } from "./radioProvider"
import { mapTuneInStation } from "./tunein.mapper"
import { TuneInService } from "./tunein.service"

class TuneInProvider implements RadioProvider {
  readonly name = "TuneIn"
  private logger = getLogger()

  constructor(private service: TuneInService) {}

  async getStation(id: string): Promise<MediaItem | undefined> {
    const data = await this.service.getStation(extractId(id))
    if (!data) return undefined
    const item = mapTuneInStation(data)
    item.uri = await this.resolvePlaybackUrl(item)
    return item
  }

  async search(keyword: string, opts?: { country?: string; offset?: number; limit?: number }) {
    this.logger.debug(`Tunein search opt ${keyword} ${JSON.stringify(opts)}`)
    let rawStations
    if (keyword != "") {
      rawStations = await this.service.search(keyword)
    } else {
      rawStations = await this.service.browseByCountry(opts?.country ?? "")
    }

    const mapped = rawStations.map((s: any) => mapTuneInStation(s, { country: opts?.country }))

    const offset = opts?.offset ?? 0
    const limit = opts?.limit ?? mapped.length

    return mapped.slice(offset, offset + limit)
  }

  async getCountries() {
    return this.service.getCountries()
  }

  async resolvePlaybackUrl(item: MediaItem) {
    return this.service.getPlaybackUrl(extractId(item.id))
  }
}

export const tuneInProvider = async (): Promise<RadioProvider> => {
  const service = new TuneInService()
  const client = new TuneInProvider(service)
  return client
}
