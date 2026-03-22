import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer"
import { fetchAllOffsetPages } from "@/infra/spotify/fetchAllOffsetPages"
import { getLogger } from "@/logger"
import type { LibraryStore, MediaItem, MediaSourceRef, PlaylistStore } from "@/types"

export class SpotifyImportService {
  private readonly normalize = new SpotifyNormalizer()
  private readonly log = getLogger()

  constructor(
    private readonly client: any, // SpotifyWebClient
    private readonly library: LibraryStore,
    private readonly playlists: PlaylistStore,
  ) {}

  async importUserLibrary(itemType: string = ""): Promise<void> {
    switch (itemType) {
      case "track":
        await this.importUserTracks()
        break
      case "album":
        await this.importUserAlbums()
        break
      case "show":
        await this.importUserShows()
        break
      case "episode":
        await this.importUserEpiaodes()
        break
      case "artist":
        // await this.importFollowedArtists()
        break
      case "playlist":
        await this.importUserPlaylists()
        break
      default:
        await this.importUserTracks()
        await this.importUserAlbums()
        await this.importUserShows()
        await this.importUserEpiaodes()
        // await this.importFollowedArtists()
        await this.importUserPlaylists()
        break
    }
  }

  async importUserTracks(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMySavedTracks(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No saved tracks returned from Spotify")
      return
    }

    const items: MediaItem[] = []

    for (const entry of res) {
      const track = entry?.track
      if (!track) continue

      const normalized = this.normalize.normalize(track)

      if (normalized) items.push(normalized)
    }

    await this.library.upsert(items)
    this.log.debug(`Imported ${items.length} tracks`)
  }

  async importUserAlbums(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMySavedAlbums(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No saved albums returned from Spotify")
      return
    }

    const items: MediaItem[] = []

    for (const entry of res) {
      const album = entry?.album
      if (!album) continue

      const normalized = this.normalize.normalize(album)

      if (normalized) items.push(normalized)
    }

    await this.library.upsert(items)
    this.log.debug(`Imported ${items.length} albums`)
  }

  async importUserShows(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMySavedShows(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No saved shows returned from Spotify")
      return
    }

    const items: MediaItem[] = []

    for (const entry of res) {
      const show = entry?.show
      if (!show) continue

      const normalized = this.normalize.normalize(show)
      if (normalized) items.push(normalized)
    }

    await this.library.upsert(items)
    this.log.debug(`Imported ${items.length} shows`)
  }

  async importUserEpiaodes(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMySavedEpisodes(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No saved episodes returned from Spotify")
      return
    }

    const items: MediaItem[] = []

    for (const entry of res) {
      const episode = entry?.episode
      if (!episode) continue

      const normalized = this.normalize.normalize(episode)
      if (normalized) items.push(normalized)
    }

    await this.library.upsert(items)
    this.log.debug(`Imported ${items.length} episodes`)
  }

  async importFollowedArtists(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMyFollowedArtists(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No followed artists returned from Spotify")
      return
    }

    const items: MediaItem[] = []

    for (const entry of res) {
      const artist = entry?.artist
      if (!artist) continue

      const normalized = this.normalize.normalize(artist)
      if (normalized) items.push(normalized)
    }

    await this.library.upsert(items)
    this.log.debug(`Imported ${items.length} followed artists`)
  }

  // ────────────────────────────────────────────────
  // IMPORT ALL USER PLAYLISTS
  // ────────────────────────────────────────────────

  async importUserPlaylists(): Promise<void> {
    const res: any = await fetchAllOffsetPages((offset) => this.client.getMyPlaylists(offset))

    if (!res) {
      this.log.warn("[SpotifyImport] No playlists returned from Spotify")
      return
    }

    for (const raw of res) {
      if (!raw?.id) continue
      await this.importPlaylist(raw.id)
    }
  }

  // ────────────────────────────────────────────────
  // IMPORT A SINGLE PLAYLIST
  // ────────────────────────────────────────────────

  async importPlaylist(playlistId: string): Promise<void> {
    const playlist = await this.client.getPlaylist(playlistId)
    if (!playlist) {
      this.log.warn(`[SpotifyImport] Playlist ${playlistId} returned no data`)
      return
    }

    const playlistRef: MediaSourceRef = {
      source: "spotify",
      itemType: "playlist",
      sourceId: playlist.id,
      uri: playlist.uri,
    }

    const name = playlist.name ?? "Untitled Playlist"
    const description = playlist.description ?? ""
    const image = playlist.images?.[0]?.url

    // Create or update local playlist
    let localId = await this.findLocalPlaylistId(playlistRef)
    if (!localId) {
      localId = await this.playlists.create(name, description, playlistRef)
      if (image) await this.playlists.updateImage(localId, image)
    }

    // ────────────────────────────────────────────────
    // FETCH TRACKS USING PAGINATION HELPER
    // ────────────────────────────────────────────────

    const rawTracks: any = await fetchAllOffsetPages(
      (offset, id) => this.client.getPlaylistTracks(id, offset),
      100,
      playlistId,
    )

    if (!rawTracks) {
      this.log.warn(`[SpotifyImport] No tracks returned for playlist ${playlistId}`)
      return
    }

    const items: MediaItem[] = []

    for (const entry of rawTracks) {
      const track = entry?.track
      if (!track) continue

      const normalized = this.normalize.normalize(track)

      if (normalized) items.push(normalized)
    }

    // ────────────────────────────────────────────────
    // STORE ITEMS + UPDATE PLAYLIST CONTENTS
    // ────────────────────────────────────────────────

    await this.library.upsert(items)

    await this.playlists.clearItems(localId)
    await this.playlists.addItems(
      localId,
      items.map((i) => i.id),
    )

    this.log.info(`[SpotifyImport] Imported playlist '${name}' (${items.length} items)`)
  }

  // ────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────

  private async findLocalPlaylistId(ref: MediaSourceRef): Promise<string | null> {
    const all = await this.playlists.list()
    const match = all.find((p) => p.source === ref.source && p.sourceId === ref.sourceId)
    return match?.id ?? null
  }
}
