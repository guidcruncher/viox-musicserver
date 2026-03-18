// src/services/spotify/types.ts

export type Market = string

export interface Paging<T> {
  href: string
  items: T[]
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
}

export interface SimplifiedTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  artists: { id: string; name: string }[]
  album?: { id: string; name: string }
}

export interface FullTrack extends SimplifiedTrack {
  popularity: number
  explicit: boolean
  preview_url: string | null
}

interface SimplifiedAlbum {
  id: string
  name: string
  album_type: string
  release_date: string
  total_tracks: number
}

export interface FullAlbum extends SimplifiedAlbum {
  genres: string[]
  label: string
  popularity: number
  tracks: Paging<SimplifiedTrack>
}
