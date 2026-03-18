export interface EqPresetRecord {
  id: number
  name: string
  gain: number
}

export interface EqBandRecord {
  id: number
  preset_id: number
  frequency: string
  gain_db: number
}

export interface MediaItemRecord {
  id: string
  title: string
  subtitle: string
  artist: string | null
  img: string | null
  type: string
  uri: string
  format: string | null
  is_folder: number
  country: string | null
  bitrate: string | null
  created_at: string // ISO timestamp
  favourite?: any | null
}

export interface MigrationLibraryRow {
  id: string
  parent: string | null
  title: string
  subtitle: string
  img: string | null
  artist: string | null
  type: string
  uri: string
  format: string | null
  isFolder: number // 0/1
  country: string | null
  bitrate: string | null
  favourite: number // 0/1
}

export interface SpotifyLibraryRow {
  id: string
  parent: string | null
  title: string
  subtitle: string
  img: string | null
  artist: string | null
  type: string
  uri: string
  format: string | null
  isFolder: number // 0/1
  country: string | null
  bitrate: string | null
  favourite: number // 0/1
}

export interface LibraryRow {
  id: string
  parent: string | null
  title: string
  subtitle: string
  img: string | null
  artist: string | null
  type: string
  uri: string
  format: string | null
  isFolder: number // 0/1
  country: string | null
  bitrate: string | null
  favourite: number // 0/1
}
