// src/services/spotify/spotifyWebClient.ts

import axios, { AxiosInstance } from "axios"

import { MediaItem } from "../../types/media-types"
import { AlbumsApi } from "./albums"
import { ArtistsApi } from "./artists"
import { AudiobooksApi } from "./audiobooks"
import { CategoriesApi } from "./categories"
import { ChaptersApi } from "./chapters"
import { EpisodesApi } from "./episodes"
import { LibraryApi } from "./library"
import { SpotifyLibraryConsolidator } from "./libraryConsolidator"
import { MarketsApi } from "./markets"
import { MediaItemMapper } from "./mediaItemMappers"
// NOTE: PlayerApi is now READ-ONLY (status, queue, devices)
import { PlayerApi } from "./player"
import { PlaylistsApi } from "./playlists"
import { SearchApi } from "./search"
import { ShowsApi } from "./shows"
import { spotifyAuthClient } from "./spotifyAuthClient"
import { TracksApi } from "./tracks"
import { UsersApi } from "./users"

class SpotifyWebClient {
  http: AxiosInstance
  librespot: AxiosInstance

  albums: AlbumsApi
  artists: ArtistsApi
  tracks: TracksApi

  playlists: PlaylistsApi
  search: SearchApi
  library: LibraryApi
  shows: ShowsApi
  episodes: EpisodesApi
  audiobooks: AudiobooksApi
  chapters: ChaptersApi
  categories: CategoriesApi
  markets: MarketsApi
  users: UsersApi
  libraryConsolidator: SpotifyLibraryConsolidator

  // read-only player
  player: PlayerApi

  constructor() {
    this.http = axios.create({
      baseURL: "https://api.spotify.com/v1",
      timeout: 8000,
    })
    this.librespot = axios.create({
      baseURL: "http://127.0.0.1:3678",
      timeout: 3000,
    })

    this.http.interceptors.request.use(async (config) => {
      const token = await spotifyAuthClient.getAccessToken()
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
      return config
    })

    this.albums = new AlbumsApi(this.http)
    this.artists = new ArtistsApi(this.http)
    this.tracks = new TracksApi(this.http)
    this.playlists = new PlaylistsApi(this.http)
    this.search = new SearchApi(this.http)
    this.library = new LibraryApi(this.http)
    this.shows = new ShowsApi(this.http)
    this.episodes = new EpisodesApi(this.http)
    this.audiobooks = new AudiobooksApi(this.http)
    this.chapters = new ChaptersApi(this.http)
    this.categories = new CategoriesApi(this.http)
    this.markets = new MarketsApi(this.http)
    this.users = new UsersApi(this.http)
    this.libraryConsolidator = new SpotifyLibraryConsolidator(
      this.library,
      this.users,
      this.playlists,
    )

    // read-only player
    this.player = new PlayerApi(this.librespot, this.http)
  }

  async getMediaItem(uri: string): Promise<MediaItem | undefined> {
    const uriParts = uri.split(":")
    if (uriParts.length !== 3) {
      return undefined
    }

    const [type, id] = [uriParts[1], uriParts[2]]
    switch (type) {
      case "track":
        return MediaItemMapper.fromTrack(await this.tracks.getTrack(id))
      case "album":
        return MediaItemMapper.fromAlbum(await this.albums.getAlbum(id))
      case "playlist":
        return MediaItemMapper.fromPlaylist(await this.playlists.getPlaylist(id))
      case "episode":
        return MediaItemMapper.fromEpisode(await this.episodes.getEpisode(id))
    }

    return undefined
  }
}

export const spotifyWebApi = new SpotifyWebClient()
