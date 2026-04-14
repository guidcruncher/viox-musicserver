import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class SpotifySourceAdapter implements AudioSourceAdapter {
  readonly id = "spotify"
  readonly caps = Capabilities.audioSources[this.id]

  private readonly api = new SpotifyWebClient()
  private readonly normalize = new SpotifyNormalizer()

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    let raw: any

    switch (options.kind) {
      case "artist":
        raw = await this.api.getMyFollows("artist", options.offset ?? 0, options.limit ?? 20)
        break
      default:
        raw = await this.api.getLatestAlbums(options.offset ?? 0, options.limit ?? 20)
        break
    }

    if (raw) {
      return raw.map((i: any) => this.normalize.normalize(i))
    }
    return []
  }

  async getItems(
    ref: MediaSourceRef,
    offset: number,
    limit: number,
  ): Promise<MediaItem[] | undefined> {
    let raw: any | undefined = undefined

    switch (ref.itemType) {
      case "show":
        raw = await this.api.getShowEpisodes(ref.sourceId, offset, limit)
        break
      case "playlist":
        raw = await this.api.getPlaylistTracks(ref.sourceId, offset, limit)
        break
      case "album":
        raw = await this.api.getAlbumTracks(ref.sourceId, offset, limit)
        break
      case "artist":
        raw = await this.api.getMyFollows(ref.itemType, offset, limit)
        break
    }

    if (raw) {
      return raw.items.map((i: any) => this.normalize.normalize(i))
    }

    return undefined
  }

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const raw: any = await this.api.search(query, offset, limit, [
      "track",
      "album",
      "show",
      "episode",
      "playlist",
    ])

    const items: any[] = [
      ...(raw.tracks?.items ?? []),
      ...(raw.albums?.items ?? []),
      ...(raw.shows?.items ?? []),
      ...(raw.episodes?.items ?? []),
      ...(raw.playlists?.items ?? []),
    ]

    return items.map((i: any) => this.normalize.normalize(i))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    let raw: any

    switch (ref.itemType) {
      case "track":
        raw = await this.api.getTrack(ref.sourceId)
        break
      case "album":
        raw = await this.api.getAlbum(ref.sourceId)
        break
      case "show":
        raw = await this.api.getShow(ref.sourceId)
        break
      case "episode":
        raw = await this.api.getEpisode(ref.sourceId)
        break
      case "playlist":
        raw = await this.api.getPlaylist(ref.sourceId)
        break
      case "artist":
        raw = await this.api.getArtist(ref.sourceId)
        break
      default:
        return undefined
    }

    return this.normalize.normalize(raw)
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    return ref.uri
  }
}
