// src/services/spotify/SpotifyLibraryConsolidator.ts

import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { dedupeMediaItemsByUri } from "./deDuplicateMediaItem"
import { LibraryApi } from "./library"
import { MediaItemMapper } from "./mediaItemMappers"
import { PlaylistsApi } from "./playlists"
import { UsersApi } from "./users"

export class SpotifyLibraryConsolidator {
  private cache: MediaItem[] | null = null
  private cacheTimestamp: number | null = null
  private market: string = ""
  private _expandPlaylists: boolean = false
  private logger: any

  constructor(
    private lib: LibraryApi,
    private users: UsersApi,
    private playlists: PlaylistsApi,
    private cacheTTLms: number = 5 * 60 * 1000,
  ) {
    this.logger = getLogger()
  }

  async getLibrary(opts: { type?: string; expandPlaylists?: boolean } = {}): Promise<MediaItem[]> {
    const full = await this.getConsolidatedLibrary(opts.expandPlaylists)

    return this.filterByType(full, opts.type)
  }

  async getLibraryPage(
    opts: {
      offset?: number
      limit?: number
      type?: string
      expandPlaylists?: boolean
    } = {},
  ) {
    const full = await this.getConsolidatedLibrary(opts.expandPlaylists)
    const filtered = this.filterByType(full, opts.type)

    const offset = opts.offset ?? 0
    const limit = opts.limit ?? 50

    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      offset,
      limit,
    }
  }

  async refresh(expandPlaylists?: boolean): Promise<void> {
    this.cache = null
    this.cacheTimestamp = null
    await this.getConsolidatedLibrary(expandPlaylists)
  }

  // ------------------------------------------------------------
  // INTERNAL: CONSOLIDATION + CACHING + SORTING
  // ------------------------------------------------------------

  private async getConsolidatedLibrary(expandPlaylists?: boolean): Promise<MediaItem[]> {
    this.logger.debug("Starting getConsolidatedLibrary")

    if (this._expandPlaylists !== (expandPlaylists ?? false)) {
      this._expandPlaylists = expandPlaylists ?? false
      this.cache = null
      this.cacheTimestamp = null
    }

    if (this.cache && this.cacheTimestamp) {
      const age = Date.now() - this.cacheTimestamp
      if (age < this.cacheTTLms) {
        this.logger.debug("Cache hit")
        return this.cache
      }
    }

    const [tracks, playlists, albums, artists] = await Promise.all([
      this.getAllTracks(),
      this.getAllPlaylists(this._expandPlaylists),
      this.getAllAlbums(),
      this.getAllArtists(),
    ])

    let consolidated = [...tracks, ...playlists, ...albums, ...artists]

    if (this._expandPlaylists) {
      consolidated = dedupeMediaItemsByUri(consolidated)
    }

    consolidated.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))

    this.cache = consolidated
    this.cacheTimestamp = Date.now()

    return consolidated
  }

  // ------------------------------------------------------------
  // INTERNAL: FILTERING
  // ------------------------------------------------------------

  private filterByType(items: MediaItem[], type?: string): MediaItem[] {
    if (!type) return items
    if (type === "") return items
    return items.filter((item) => item.type === type)
  }

  // ------------------------------------------------------------
  // INTERNAL: FETCHERS
  // ------------------------------------------------------------

  private async getMarket(): Promise<string> {
    if (this.market !== "") return this.market
    const profile = await this.users.getCurrentUserProfile()
    this.market = profile.country || "US"
    return this.market
  }

  private async getAllPlaylistItems(
    id: string,
    opts: {
      market?: string
      fields?: string
      limit?: number
      offset?: number
      additional_types?: string
    } = {},
  ): Promise<MediaItem[]> {
    const items: MediaItem[] = []
    try {
      const cfg = { ...opts }
      let offset = opts.offset ?? 0
      const limit = opts.limit ?? 50
      cfg.market = await this.getMarket()
      this.logger.debug(`Getting playlist items for ${id}`)
      while (true) {
        const page = await this.playlists.getPlaylistItems(id, {
          ...cfg,
          offset,
          limit,
        })

        for (const entry of page.items ?? []) {
          const raw = entry.item
          const mapped = MediaItemMapper.fromAny(raw)
          if (mapped) {
            mapped.parent = `spotify:playlist:${id}`
            items.push(mapped)
          }
        }

        if (!page.next) break
        offset += limit
      }
    } catch (err) {
      this.logger.error(`Error fetching playlist items for ${id}:`, err)
    }

    return items
  }

  private async getAllPlaylists(expandPlaylists: boolean): Promise<MediaItem[]> {
    try {
      const playlists: any[] = []
      let offset = 0
      const limit = 50
      const userMarket = await this.getMarket()
      this.logger.debug(`Getting all playlists`)
      while (true) {
        const page = await this.lib.getSavedPlaylists({ limit, offset, market: userMarket })
        playlists.push(...page.items)
        if (!page.next) break
        offset += limit
      }

      if (!expandPlaylists) {
        return playlists.map((p) => MediaItemMapper.fromPlaylist(p)).filter(Boolean) as MediaItem[]
      }

      // Expand playlists → return playlist tracks instead of playlist containers
      const allTracks: MediaItem[] = []
      this.logger.debug(`Expanding playlists into tracks`)

      for (const playlist of playlists) {
        const pl = MediaItemMapper.fromPlaylist(playlist)
        if (pl) {
          allTracks.push(pl)
        }
        const mapped = await this.getAllPlaylistItems(playlist.id)
        allTracks.push(...mapped)
      }

      return allTracks
    } catch (err) {
      this.logger.error(`Error fetching playlists:`, err)
      return []
    }
  }

  private async getAllAlbums(): Promise<MediaItem[]> {
    try {
      const items: any[] = []
      let offset = 0
      const limit = 50
      const userMarket = await this.getMarket()
      this.logger.debug(`Getting all albums`)
      while (true) {
        const page = await this.lib.getSavedAlbums({ limit, offset, market: userMarket })
        items.push(...page.items)
        if (!page.next) break
        offset += limit
      }

      return items
        .map(({ album }) => MediaItemMapper.fromAlbum(album))
        .filter(Boolean) as MediaItem[]
    } catch (err) {
      this.logger.error(`Error fetching albums:`, err)
      return []
    }
  }

  private async getAllArtists(): Promise<MediaItem[]> {
    try {
      const items: any[] = []
      let after: string | undefined = undefined
      const limit = 50
      this.logger.debug(`Getting all artists`)
      while (true) {
        const page = await this.lib.getFollowedArtists({ limit, after })
        items.push(...page.artists.items)

        const cursor = page.artists.cursors?.after
        if (!cursor) break
        after = cursor
      }

      return items.map((a) => MediaItemMapper.fromArtist(a)).filter(Boolean) as MediaItem[]
    } catch (err) {
      this.logger.error(`Error fetching artists:`, err)
      return []
    }
  }

  private async getAllTracks(): Promise<MediaItem[]> {
    try {
      const items: any[] = []
      let offset = 0
      const limit = 50
      const userMarket = await this.getMarket()
      this.logger.debug(`Getting all tracks`)
      while (true) {
        const page = await this.lib.getSavedTracks({ limit, offset, market: userMarket })
        items.push(...page.items)
        if (!page.next) break
        offset += limit
      }

      return items
        .map(({ track }) => MediaItemMapper.fromTrack(track))
        .filter(Boolean) as MediaItem[]
    } catch (err) {
      this.logger.error(`Error fetching tracks:`, err)
      return []
    }
  }
}
