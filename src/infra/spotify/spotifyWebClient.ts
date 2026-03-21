import axios, { AxiosInstance } from "axios"

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

  search(query: string, types: string[]) {
    return this.safeGet(() =>
      this.http.get("/search", {
        params: { q: query, type: types.join(","), limit: 20 },
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
        params: { offset, limit: 20 },
      }),
    )
  }

  getAlbumTracks(id: string, offset = 0) {
    return this.safeGet(() =>
      this.http.get(`/albums/${id}/tracks`, {
        params: { offset, limit: 20 },
      }),
    )
  }

  getShowEpisodes(id: string, offset = 0) {
    return this.safeGet(() =>
      this.http.get(`/shows/${id}/episodes`, {
        params: { offset, limit: 20 },
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
    return this.safeGet(() => this.http.get("/me/tracks", { params: { offset, limit: 20 } }))
  }

  getMySavedAlbums(offset = 0) {
    return this.safeGet(() => this.http.get("/me/albums", { params: { offset, limit: 20 } }))
  }

  getMySavedShows(offset = 0) {
    return this.safeGet(() => this.http.get("/me/shows", { params: { offset, limit: 20 } }))
  }

  getMySavedEpisodes(offset = 0) {
    return this.safeGet(() => this.http.get("/me/episodes", { params: { offset, limit: 20 } }))
  }

  getMyPlaylists(offset = 0) {
    return this.safeGet(() => this.http.get("/me/playlists", { params: { offset, limit: 20 } }))
  }

  getMyFollowedArtists(after?: string) {
    return this.safeGet(() =>
      this.http.get("/me/following", {
        params: { type: "artist", after, limit: 20 },
      }),
    )
  }

  getRecentlyPlayed(limit = 20) {
    return this.safeGet(() =>
      this.http.get("/me/player/recently-played", {
        params: { limit },
      }),
    )
  }
}
