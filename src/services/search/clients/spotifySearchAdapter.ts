// clients/podverse/search-adapter.ts
import { getLogger } from "../../../logger"
import { spotifyWebApi } from "../../spotify/spotifyWebClient"
import type { UnifiedSearchResult } from "../types"
import type { BackendSearchClient } from "./types"

const logger = getLogger()

export const spotifySearchAdapter: BackendSearchClient = {
  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    try {
      const promises: Promise<any>[] = []
      let items: UnifiedSearchResult[] = []

      promises.push(spotifyWebApi.search.search(query, ["album"], { offset: 0, limit: limit }))
      promises.push(spotifyWebApi.search.search(query, ["track"], { offset: 0, limit: limit }))
      promises.push(spotifyWebApi.search.search(query, ["show"], { offset: 0, limit: limit }))

      return Promise.all(promises).then((result: any[]) => {
        result.forEach((res) => {
          const data = res.tracks || res.albums || res.shows
          const resultset = data.items.map((track: any) => ({
            id: track.uri,
            uri: track.uri,
            backend: "spotify",
            type: track.uri.split(":")[1],
            title: track.name,
            format: "spotify",
            artist: track.artists
              ? track.artists.map((a: any) => a.name).join(", ")
              : track.description
                ? track.description
                : "",
            album: track.album ? track.album.name : track.name,
            duration: track.duration_ms / 1000,
            artworkUrl: track.album ? track.album.images?.[0]?.url : track.images?.[0]?.url,
            meta: {
              titleMatch: track.name.toLowerCase().includes(query.toLowerCase()),
              popularity: track.popularity,
            },
          }))
          items = items.concat(resultset)
        })
        return items
      })
    } catch (err) {
      logger.error(`Error searching spotify`, err)
      return []
    }
  },
}
