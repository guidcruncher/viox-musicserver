import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer"
import type { LibraryStore, MediaItem, MediaSourceRef, PlaylistStore } from "@/types"

export class SpotifyImportService {
  private readonly normalize = new SpotifyNormalizer()

  constructor(
    private readonly client: any, // Spotify Web API client
    private readonly library: LibraryStore,
    private readonly playlists: PlaylistStore,
  ) {}

  async importUserPlaylists(): Promise<void> {
    const rawPlaylists = await this.client.getUserPlaylists()

    for (const raw of rawPlaylists.items) {
      await this.importPlaylist(raw.id)
    }
  }

  async importPlaylist(playlistId: string): Promise<void> {
    const playlist = await this.client.getPlaylist(playlistId)

    // Create or update playlist metadata
    const playlistRef: MediaSourceRef = {
      source: "spotify",
      itemType: "playlist",
      sourceId: playlist.id,
      uri: playlist.uri,
    }

    const playlistName = playlist.name
    const playlistDescription = playlist.description
    const playlistImage = playlist.images?.[0]?.url

    // Create local playlist if not exists
    let localId = await this.findLocalPlaylistId(playlistRef)
    if (!localId) {
      localId = await this.playlists.create(playlistName, playlistDescription)
      await this.playlists.updateImage(localId, playlistImage)
    }

    // Fetch items
    const items: MediaItem[] = []
    let offset = 0

    while (true) {
      const page = await this.client.getPlaylistTracks(playlistId, { offset })
      for (const entry of page.items) {
        if (!entry.track) continue
        items.push(this.normalize.normalize(entry.track))
      }
      if (!page.next) break
      offset += page.items.length
    }

    // Store items
    await this.library.upsert(items)

    // Replace playlist contents
    await this.playlists.clearItems(localId)
    await this.playlists.addItems(
      localId,
      items.map((i) => i.id),
    )
  }

  private async findLocalPlaylistId(ref: MediaSourceRef): Promise<string | null> {
    const all = await this.playlists.list()
    return all.find((p) => p.source === "spotify" && p.sourceId === ref.sourceId)?.id ?? null
  }
}
