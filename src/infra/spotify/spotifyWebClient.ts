import axios, { AxiosInstance } from "axios"

import { logger } from "@/logger"

import { BaseClient } from "../baseClient"
import { PlayerApi } from "./playerApi"
import { spotifyAuthClient } from "./spotifyAuthClient"

interface SpotifyWebClientOptions {
  librespotBaseUrl?: string
}

export class SpotifyWebClient extends BaseClient {
  private librespot: AxiosInstance

  public player: PlayerApi

  constructor(opts: SpotifyWebClientOptions = {}) {
    super({
      baseURL: "https://api.spotify.com/v1",
      timeout: 8000,
    })

    this.http.interceptors.request.use(async (config) => {
      const token = await spotifyAuthClient.getAccessToken()
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
      return config
    })

    this.librespot = axios.create({
      baseURL: opts.librespotBaseUrl ?? "http://127.0.0.1:3678",
      timeout: 3000,
    })

    this.player = new PlayerApi(this.librespot, this.http)
  }

  // ────────────────────────────────────────────────
  // SEARCH + CONTENT
  // ────────────────────────────────────────────────

  async getTrack(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/tracks/${id}`))
  }

  async getAlbum(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/albums/${id}`))
  }

  async getShow(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/shows/${id}`))
  }

  async getEpisode(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/episodes/${id}`))
  }

  async getPlaylist(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/playlists/${id}`))
  }

  async getPlaylistTracks(id: string, offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() =>
      this.http.get(`/playlists/${id}/tracks`, {
        params: { offset, limit },
      }),
    )
  }

  async getAlbumTracks(id: string, offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() =>
      this.http.get(`/albums/${id}/tracks`, {
        params: { offset, limit },
      }),
    )
  }

  async getShowEpisodes(id: string, offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() =>
      this.http.get(`/shows/${id}/episodes`, {
        params: { offset, limit },
      }),
    )
  }

  async getAllShowEpisodes(showId: string): Promise<any[]> {
    const limit = 50
    let offset = 0
    const all: any[] = []

    while (true) {
      const res = await this.getShowEpisodes(showId, offset, limit)
      if (!res || !res.items) break

      all.push(...res.items)

      if (res.items.length < limit) break
      offset += limit
    }

    return all
  }

  // ────────────────────────────────────────────────
  // USER LIBRARY
  // ────────────────────────────────────────────────

  async getMe(): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me"))
  }

  async getMySavedTracks(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me/tracks", { params: { offset, limit } }))
  }

  async getMySavedAlbums(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me/albums", { params: { offset, limit } }))
  }

  async getMySavedShows(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me/shows", { params: { offset, limit } }))
  }

  async getMySavedEpisodes(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me/episodes", { params: { offset, limit } }))
  }

  async getMyPlaylists(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() => this.http.get("/me/playlists", { params: { offset, limit } }))
  }

  async getArtist(id: string): Promise<any | undefined> {
    return this.safeGet(() => this.http.get(`/artists/${id}`))
  }

  async getMyFollows(type: string, _offset: number, _limit: number): Promise<any | undefined> {
    const data: any[] = []
    let after: string | undefined = undefined

    while (true) {
      const res: any = this.safeGet(() =>
        this.http.get("/me/following", {
          params: { type, after, limit: 20 },
        }),
      )
      if (!res) {
        break
      }

      if (!res.artists) {
        break
      }

      data.push(...res.artists.items)
      if (!res.artists.cursors.after) {
        break
      }

      after = res.artists.cursors.after
    }

    const result: any = { items: data }
    return result
  }

  async getRecentlyPlayed(offset: number, limit: number): Promise<any | undefined> {
    return this.safeGet(() =>
      this.http.get("/me/player/recently-played", {
        params: { offset, limit },
      }),
    )
  }

  async getMostPopular(offset: number, limit: number): Promise<any[] | undefined> {
    const res = await this.search('"* tag:popular"', offset, limit, ["album"])
    if (!res) return undefined
    return res.albums.items
  }

  async getLeastPopular(offset: number, limit: number): Promise<any[] | undefined> {
    const res = await this.search('"* tag:hipster"', offset, limit, ["album"])
    if (!res) return undefined
    return res.albums.items
  }

  async getLatestAlbums(offset: number, limit: number): Promise<any[] | undefined> {
    const res = await this.search('"* tag:new"', offset, limit, ["album"])
    if (!res) return undefined
    return res.albums.items
  }

  async getArtistAlbums(id: string, offset: number, limit: number): Promise<any[] | undefined> {
    const artist: any = await this.getArtist(id)
    if (!artist) {
      return undefined
    }

    const res: any = await this.safeGet(() =>
      this.http.get(`/artists/${artist.id}/albums`, { params: { offset, limit } }),
    )

    if (!res) return undefined
    return res.items
  }

  async getArtistTracks(id: string, offset: number, limit: number): Promise<any[] | undefined> {
    const artist: any = await this.getArtist(id)
    if (!artist) {
      return undefined
    }

    const res = await this.search(`artist:${artist.name}`, offset, limit, ["track"])
    if (!res) return undefined
    return res.tracks.items
  }

  async getArtistByName(name: string): Promise<any | undefined> {
    const artists: any = await this.search(`artist:${name}`, 0, 10, ["artist"])
    if (!artists) {
      return undefined
    }

    for (let i = 0; i < artists.artists.items.length; i++) {
      if (artists.artists.items[i].name.toLowerCase() == name.toLowerCase()) {
        return artists.artists.items[i]
      }
    }

    return undefined
  }

  async search(
    q: string,
    offset: number,
    limit: number,
    types: string[] = ["album"],
  ): Promise<any | undefined> {
    try {
      const data: any = await this.safeGet(() =>
        this.http.get("/search", { params: { q: q, type: types.join(","), offset, limit } }),
      )

      if (!data) return undefined
      return data
    } catch (err) {
      logger.error("Error in search", err)
      return []
    }
  }
}
