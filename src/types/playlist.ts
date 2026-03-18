export interface Playlist {
  id: string // internal VIOX ID
  name: string
  description?: string
  imageUrl?: string

  source: "local" | "spotify"
  sourceId?: string // spotify playlist ID
  sourceUri?: string // spotify:playlist:xxx

  totalItems: number
}
