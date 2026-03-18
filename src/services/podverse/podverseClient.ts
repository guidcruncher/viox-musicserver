import axios, { AxiosInstance } from "axios"

import { MediaItem } from "../../types/media-types"
import { AuthService } from "./authService"
import { CategoryService } from "./categoryService"
import { EpisodeService } from "./episodeService"
import { MediaRefService } from "./mediaRefService"
import { PlaylistService } from "./playlistService"
import { PodcastService } from "./podcastService"
import { PodcastSubscriptionService } from "./podcastSubscriptionService"
import { Episode, MediaRef, Podcast } from "./types"
import { UserService } from "./userService"

interface PodverseClientOptions {
  baseURL?: string
  token?: string
}

export class PodverseClient {
  readonly http: AxiosInstance

  readonly podcast: PodcastService
  readonly episode: EpisodeService
  readonly mediaRef: MediaRefService
  readonly playlist: PlaylistService
  readonly user: UserService
  readonly auth: AuthService
  readonly category: CategoryService
  readonly subscriptions: PodcastSubscriptionService

  constructor(options: PodverseClientOptions = {}) {
    this.http = axios.create({
      baseURL: options.baseURL ?? "https://api.podverse.fm/api/v1",
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    })

    this.category = new CategoryService(this.http)
    this.podcast = new PodcastService(this.http)
    this.episode = new EpisodeService(this.http)
    this.mediaRef = new MediaRefService(this.http)
    this.playlist = new PlaylistService(this.http)
    this.user = new UserService(this.http)
    this.auth = new AuthService(this.http)
    this.subscriptions = new PodcastSubscriptionService()
  }

  setToken(token: string) {
    this.http.defaults.headers.Authorization = `Bearer ${token}`
  }

  private podcastToMediaItem(podcast: Podcast): MediaItem {
    return {
      id: `podverse:podcast:${podcast.id}`,
      title: podcast.title ?? "Untitled Podcast",
      subtitle: podcast.description ?? "",
      img: podcast.imageUrl,
      artist: podcast.authors?.map((a) => a.name).join(", "),
      type: "podcast",
      uri: podcast.feedUrls ? (podcast.feedUrls.length > 0 ? podcast.feedUrls[0].url : "") : "",
      format: "rss",
      isFolder: true,
      country: undefined,
      bitrate: undefined,
    }
  }

  private episodeToMediaItem(episode: Episode): MediaItem {
    return {
      id: `podverse:episode:${episode.id}`,
      title: episode.title ?? "Untitled Episode",
      subtitle: episode.description ?? "",
      img: episode.imageUrl ?? episode.podcast?.imageUrl,
      artist: episode.podcast?.title,
      type: "episode",
      uri: episode.mediaUrl,
      format: "audio/mpeg",
      isFolder: false,
      country: undefined,
      bitrate: undefined,
      duration: episode.duration ? episode.duration : undefined,
    }
  }

  private mediaRefToMediaItem(ref: MediaRef): MediaItem {
    const episode = ref.episode
    const podcast = ref.podcast

    return {
      id: `podverse:mediaref:${ref.id}`,
      title: ref.title ?? episode?.title ?? "Untitled Clip",
      subtitle: ref.description ?? episode?.description ?? "",
      img: episode?.imageUrl ?? podcast?.imageUrl,
      artist: podcast?.title,
      type: "podcast",
      uri: this.buildMediaRefUri(ref),
      format: "audio/mpeg",
      isFolder: false,
      country: undefined,
      bitrate: undefined,
    }
  }

  private buildMediaRefUri(ref: MediaRef): string {
    const episodeId = ref.episode?.id ?? "unknown"
    const start = ref.startTime ?? 0
    return `mediaref:${ref.id}:episode:${episodeId}:start:${start}`
  }

  toMediaItem(input: Podcast | Episode | MediaRef): MediaItem {
    // MediaRef has startTime (required) and episode/podcast references
    if ("startTime" in input) {
      return this.mediaRefToMediaItem(input)
    }

    // Episode has mediaUrl (required)
    if ("mediaUrl" in input) {
      return this.episodeToMediaItem(input)
    }

    // Podcast fallback
    return this.podcastToMediaItem(input)
  }
}

export const podverseClient = new PodverseClient()
