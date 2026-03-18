// clients/podverse/search-adapter.ts
import { getLogger } from "../../../logger"
import { radioBrowserProvider } from "../../radio/radioBrowserProvider"
import type { UnifiedSearchResult } from "../types"
import type { BackendSearchClient } from "./types"

const logger = getLogger()

export const radioSearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const radioApi = await radioBrowserProvider()
      if (!radioApi) {
        return []
      }

      const stations = await radioApi.search(query, {
        offset: 0,
        limit: limit,
      })

      return stations.map((st: any) => ({
        id: st.id,
        uri: st.uri,
        backend: "radio",
        type: "radio",
        title: st.title,
        artist: st.subtitle,
        artworkUrl: st.img,
        meta: {
          titleMatch: st.title.toLowerCase().includes(query.toLowerCase()),
          bitrate: st.bitrate,
        },
      }))
    } catch (err) {
      logger.error(`Error searching radiobrowser`, err)
      return []
    }
  },
}
