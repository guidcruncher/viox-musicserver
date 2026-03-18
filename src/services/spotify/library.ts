// src/services/spotify/library.ts
import { AxiosInstance } from "axios"

import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"

export class LibraryApi {
  constructor(private http: AxiosInstance) {}

  async getSavedTracks(opts: { limit?: number; offset?: number; market?: string } = {}) {
    const res = await this.http.get("/me/tracks", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async getSavedPlaylists(opts: { limit?: number; offset?: number; market?: string } = {}) {
    const res = await this.http.get("/me/playlists", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async saveTracks(ids: string[]) {
    await this.http.put("/me/tracks", null, {
      params: { ids: ids.join(",") },
    })
  }

  async removeTracks(ids: string[]) {
    await this.http.delete("/me/tracks", {
      params: { ids: ids.join(",") },
    })
  }

  async checkSavedTracks(ids: string[]): Promise<boolean[]> {
    const res = await this.http.get("/me/tracks/contains", {
      params: { ids: ids.join(",") },
    })
    return stripSpotifyFields(res.data)
  }

  async getSavedAlbums(opts: { limit?: number; offset?: number; market?: string } = {}) {
    const res = await this.http.get("/me/albums", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async saveAlbums(ids: string[]) {
    await this.http.put("/me/albums", null, {
      params: { ids: ids.join(",") },
    })
  }

  async removeAlbums(ids: string[]) {
    await this.http.delete("/me/albums", {
      params: { ids: ids.join(",") },
    })
  }

  async checkSavedAlbums(ids: string[]): Promise<boolean[]> {
    const res = await this.http.get("/me/albums/contains", {
      params: { ids: ids.join(",") },
    })
    return stripSpotifyFields(res.data)
  }

  async getSavedShows(opts: { limit?: number; offset?: number } = {}) {
    const res = await this.http.get("/me/shows", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async saveShows(ids: string[]) {
    await this.http.put("/me/shows", null, {
      params: { ids: ids.join(",") },
    })
  }

  async removeShows(ids: string[]) {
    await this.http.delete("/me/shows", {
      params: { ids: ids.join(",") },
    })
  }

  async checkSavedShows(ids: string[]): Promise<boolean[]> {
    const res = await this.http.get("/me/shows/contains", {
      params: { ids: ids.join(",") },
    })
    return stripSpotifyFields(res.data)
  }

  async getSavedAudiobooks(opts: { limit?: number; offset?: number } = {}) {
    const res = await this.http.get("/me/audiobooks", { params: opts })
    return stripSpotifyFields(res.data)
  }

  async saveAudiobooks(ids: string[]) {
    await this.http.put("/me/audiobooks", null, {
      params: { ids: ids.join(",") },
    })
  }

  async removeAudiobooks(ids: string[]) {
    await this.http.delete("/me/audiobooks", {
      params: { ids: ids.join(",") },
    })
  }

  async checkSavedAudiobooks(ids: string[]): Promise<boolean[]> {
    const res = await this.http.get("/me/audiobooks/contains", {
      params: { ids: ids.join(",") },
    })
    return stripSpotifyFields(res.data)
  }

  async getFollowedArtists(opts: { limit?: number; after?: string } = {}) {
    const res = await this.http.get("/me/following", {
      params: { type: "artist", ...opts },
    })
    return stripSpotifyFields(res.data)
  }
}
