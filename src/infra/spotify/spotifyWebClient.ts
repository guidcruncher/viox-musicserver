import axios, { AxiosInstance } from "axios"

import { PlayerApi } from "./playerApi"
import { spotifyAuthClient } from "./spotifyAuthClient"

interface SpotifyWebClientOptions {
  librespotBaseUrl?: string
}

export class SpotifyWebClient {
  private http: AxiosInstance
  private librespot: AxiosInstance

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

  async search(query: string, types: string[]) {
    const res = await this.http.get("/search", {
      params: {
        q: query,
        type: types.join(","),
        limit: 50,
      },
    })
    return res.data
  }

  async getTrack(id: string) {
    return (await this.http.get(`/tracks/${id}`)).data
  }

  async getAlbum(id: string) {
    return (await this.http.get(`/albums/${id}`)).data
  }

  async getShow(id: string) {
    return (await this.http.get(`/shows/${id}`)).data
  }

  async getEpisode(id: string) {
    return (await this.http.get(`/episodes/${id}`)).data
  }

  async getPlaylist(id: string) {
    return (await this.http.get(`/playlists/${id}`)).data
  }

  async getPlaylistTracks(id: string, offset = 0) {
    return (
      await this.http.get(`/playlists/${id}/tracks`, {
        params: { offset, limit: 100 },
      })
    ).data
  }

  async getAlbumTracks(id: string, offset = 0) {
    return (
      await this.http.get(`/albums/${id}/tracks`, {
        params: { offset, limit: 50 },
      })
    ).data
  }

  async getShowEpisodes(id: string, offset = 0) {
    return (
      await this.http.get(`/shows/${id}/episodes`, {
        params: { offset, limit: 50 },
      })
    ).data
  }
}
