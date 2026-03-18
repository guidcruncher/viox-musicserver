import { MediaItem } from "../../types/media-types"
import { radioBrowserProvider } from "./radioBrowserProvider"
import { tuneInProvider } from "./tuneinProvider"

export interface RadioProvider {
  readonly name: string

  search(
    keyword: string,
    opts?: {
      country?: string
      offset?: number
      limit?: number
    },
  ): Promise<MediaItem[]>

  getCountries(): Promise<Array<{ code: string; name: string }>>

  getStation(id: string): Promise<MediaItem | undefined>

  resolvePlaybackUrl(item: MediaItem): Promise<string>
}

export const radioProvider = async (provider: string): Promise<RadioProvider | undefined> => {
  switch (provider.toLowerCase().trim()) {
    case "radiobrowser":
    default:
      return await radioBrowserProvider()
    case "tunein":
      return await tuneInProvider()
  }
}
