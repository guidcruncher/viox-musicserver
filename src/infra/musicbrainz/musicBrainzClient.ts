import axios, { AxiosInstance } from "axios"

import { axiosFactory } from "@/infra/axiosFactory"
import { SqliteMusicBrainzStore } from "@/infra/musicBrainzStore"
import { logger } from "@/logger"
import { MusicBrainzStore } from "@/types"

export class MusicBrainzClient {
  private readonly client: AxiosInstance
  private readonly validSpotifyTypes = ["track", "album", "artist"]

  constructor(
    private readonly store: MusicBrainzStore,
    baseURL: string = "https://musicbrainz.org/ws/2",
  ) {
    this.client = axiosFactory({
      baseURL,
      timeout: 10_000,
      headers: {
        "User-Agent": "MusicBrainzClient/1.0.0 (contact@example.com)",
        Accept: "application/json",
      },
    })
  }

  /**
   * Resolves MBIDs from a Spotify URI by querying the MusicBrainz URL resource endpoint.
   */
  public async getMbidFromSpotifyUri(uri: string): Promise<string[]> {
    try {
      const spotifyUrl = this.parseSpotifyUriToUrl(uri)
      const endpoint = `/url`

      const { data } = await this.client.get(endpoint, {
        params: {
          resource: spotifyUrl,
          inc: "recording-rels+release-rels+artist-rels",
          fmt: "json",
        },
      })

      const relations = data.relations || []
      return relations
        .map((rel: any) => rel.recording?.id || rel.release?.id || rel.artist?.id)
        .filter(Boolean)
    } catch (error) {
      logger.error("Error in getMbidFromSpotify", error)
      return this.handleError(error)
    }
  }

  /**
   * Resolves MBIDs for recordings associated with a specific ISRC.
   */
  public async getMbidsFromIsrc(isrc: string): Promise<string[]> {
    try {
      const { data } = await this.client.get(`/isrc/${isrc}`, {
        params: { fmt: "json" },
      })
      await this.getMbidRecordFromIsrc(isrc)
      return data.recordings?.map((rec: any) => rec.id) ?? []
    } catch (error) {
      logger.error("Error in getMbidsFromIsrc", error)
      return this.handleError(error)
    }
  }

  public async getMbidRecordFromIsrc(isrc: string): Promise<Record<string, string[] | string>> {
    try {
      const res: Record<string, string[] | string> = {}
      logger.debug(`Making Musicbriainz request for ${isrc}`)
      const { data } = await this.client.get(`/isrc/${isrc}`, {
        params: { fmt: "json", inc: "recording-rels+release-rels+artist-rels" },
      })

      if (!data) {
        logger.error(`Error getting musicbrainz record for ${isrc} nothing found`)
        return {}
      }
      const recording = data.recordings[0]
      const relations = recording.relations || []
      res["isrc"] = data.isrc as string
      res["mbid"] = recording.id as string

      for (const relationship of relations) {
        if (relationship.artist) {
          const type = relationship.type
          const artistId = relationship.artist.id

          if (!Array.isArray(res[type])) {
            res[type] = []
          }
          if (!res[type].includes(artistId)) res[type].push(artistId)
        }
      }

      Object.keys(res).forEach(async (key) => {
        if (key != "isrc") {
          await this.store.upsert(isrc, key, JSON.stringify(res[key]))
        }
      })

      return res
    } catch (error) {
      logger.error("Error in getMbidRecordFromIsrc", error)
      this.handleError(error)
      return {}
    }
  }

  /**
   * Internal helper to transform Spotify URIs into lookup URLs.
   */
  private parseSpotifyUriToUrl(uri: string): string {
    const parts = uri.split(":")

    if (parts.length !== 3 || parts[0] !== "spotify") {
      throw new Error(`Invalid Spotify URI format: ${uri}`)
    }

    const [, type, id] = parts

    if (!this.validSpotifyTypes.includes(type)) {
      throw new Error(
        `Type ${type} is not a valid Spotify type, expected [${this.validSpotifyTypes.join(", ")}]`,
      )
    }

    return `https://open.spotify.com/${type}/${id}`
  }

  /**
   * Centralized error handling for Axios requests.
   */
  private handleError(err: unknown): string[] {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) return []
      logger.error(`MusicBrainz API Error: ${err.response?.status}`, err.message)
    } else {
      logger.error("Unexpected Error in MusicBrainzClient", err)
    }
    return []
  }
}

export const musicBrainzClient = new MusicBrainzClient(new SqliteMusicBrainzStore())
