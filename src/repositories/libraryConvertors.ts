import { MediaItem } from "../types/media-types"
import { LibraryRow, MigrationLibraryRow, SpotifyLibraryRow } from "./types"

export const toRow = (item: MediaItem): MigrationLibraryRow | LibraryRow | SpotifyLibraryRow => ({
  id: String(item.id),
  parent: item.parent ?? null,
  title: item.title,
  subtitle: item.subtitle,
  img: item.img ?? null,
  artist: item.artist ?? null,
  type: item.type,
  uri: item.uri,
  format: item.format ?? null,
  isFolder: item.isFolder ? 1 : 0,
  country: item.country ?? null,
  bitrate: item.bitrate ?? null,
  favourite: item.favourite ? 1 : 0,
})

export const fromRow = (row: MigrationLibraryRow | LibraryRow | SpotifyLibraryRow): MediaItem => ({
  id: row.id,
  parent: row.parent ?? undefined,
  title: row.title,
  subtitle: row.subtitle,
  img: row.img ?? undefined,
  artist: row.artist ?? undefined,
  type: row.type,
  uri: row.uri,
  format: row.format ?? undefined,
  isFolder: !!row.isFolder,
  country: row.country ?? undefined,
  bitrate: row.bitrate ?? undefined,
  favourite: !!row.favourite,
})
