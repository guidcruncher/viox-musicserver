import axios, { AxiosError, AxiosInstance } from "axios"

import { getLogger } from "@/logger"

import { PlayerApi } from "./playerApi"
import { spotifyAuthClient } from "./spotifyAuthClient"

interface SpotifyWebClientOptions {
  librespotBaseUrl?: string
}

export class SpotifyWebClient {
  private http: AxiosInstance
  private librespot: AxiosInstance
  private log = getLogger()

  public player: PlayerApi

  constructor(opts: SpotifyWebClientOptions = {}) {
    this.http = axios.create({
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
  // Helpers
  // ────────────────────────────────────────────────

  private unwrap<T>(data: T | undefined | null): T | undefined {
    if (!data) {
      this.log.warn("[Spotify] No data returned")
      return undefined
    }
    return data
  }

  private async safeGet<T>(fn: () => Promise<any>): Promise<T | undefined> {
    try {
      const res = await fn()
      return this.unwrap(res.data)
    } catch (err) {
      this.handleError(err)
      return undefined
    }
  }

  private handleError(err: unknown) {
    if (axios.isAxiosError(err)) {
      const e = err as AxiosError

      if (e.response) {
        this.log.error(
          `[Spotify] HTTP ${e.response.status} – ${e.response.statusText}`,
          e.response.data,
        )
      } else if (e.request) {
        this.log.error("[Spotify] No response received", e.message)
      } else {
        this.log.error("[Spotify] Request setup error", e.message)
      }
    } else {
      this.log.error("[Spotify] Unknown error", err)
    }
  }

  // ────────────────────────────────────────────────
  // SEARCH + CONTENT
  // ────────────────────────────────────────────────

  search(query: string, types: string[]) {
    return this.safeGet(() =>
      this.http.get("/search", {
        params: { q: query, type: types.join(","), limit: 50 },
      }),
    )
  }

  getTrack(id: string) {
    return this.safeGet(() => this.http.get(`/tracks/${id}`))
  }

  getAlbum(id: string) {
    return this.safeGet(() => this.http.get(`/albums/${id}`))
  }

  getShow(id: string) {
    return this.safeGet(() => this.http.get(`/shows/${id}`))
  }

  getEpisode(id: string) {
    return this.safeGet(() => this.http.get(`/episodes/${id}`))
  }

  getPlaylist(id: string) {
    return this.safeGet(() => this.http.get(`/playlists/${id}`))
  }

  getPlaylistTracks(id: string, offset = 0) {
    return this.safeGet(() =>
      this.http.get(`/playlists/${id}/tracks`, {
        params: { offset, limit: 100 },
      }),
    )
  }

  getAlbumTracks(id: string, offset = 0) {
    return this.safeGet(() =>
      this.http.get(`/albums/${id}/tracks`, {
        params: { offset, limit: 50 },
      }),
    )
  }

  getShowEpisodes(id: string, offset = 0) {
    return this.safeGet(() =>
      this.http.get(`/shows/${id}/episodes`, {
        params: { offset, limit: 50 },
      }),
    )
  }

  // ────────────────────────────────────────────────
  // USER LIBRARY
  // ────────────────────────────────────────────────

  getMe() {
    return this.safeGet(() => this.http.get("/me"))
  }

  getMySavedTracks(offset = 0) {
    return this.safeGet(() => this.http.get("/me/tracks", { params: { offset, limit: 50 } }))
  }

  getMySavedAlbums(offset = 0) {
    return this.safeGet(() => this.http.get("/me/albums", { params: { offset, limit: 50 } }))
  }

  getMySavedShows(offset = 0) {
    return this.safeGet(() => this.http.get("/me/shows", { params: { offset, limit: 50 } }))
  }

  getMySavedEpisodes(offset = 0) {
    return this.safeGet(() => this.http.get("/me/episodes", { params: { offset, limit: 50 } }))
  }

  getMyPlaylists(offset = 0) {
    return this.safeGet(() => this.http.get("/me/playlists", { params: { offset, limit: 50 } }))
  }

  getMyFollowedArtists(after?: string) {
    return this.safeGet(() =>
      this.http.get("/me/following", {
        params: { type: "artist", after, limit: 50 },
      }),
    )
  }

  getRecentlyPlayed(limit = 50) {
    return this.safeGet(() =>
      this.http.get("/me/player/recently-played", {
        params: { limit },
      }),
    )
  }
}
