// clients/podverse/search-adapter.ts
import { getLogger } from "../../../logger"
import { tuneInProvider } from "../../radio/tuneinProvider"
import type { UnifiedSearchResult } from "../types"
import type { BackendSearchClient } from "./types"

const logger = getLogger()

export const tuneinRadioSearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const radioApi = await tuneInProvider()
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
      logger.error(`Error searching tunein radiobrowser`, err)
      return []
    }
  },
}
