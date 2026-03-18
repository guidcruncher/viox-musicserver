import { MediaSourceRef } from "./index"

export interface PlaylistMetadata {
  id: string // internal VIOX playlist ID (uuid)
  sourceRef: MediaSourceRef // spotify:playlist:xxxx
  name: string
  description?: string
  imageUrl?: string
  ownerName?: string
  totalItems: number
}
