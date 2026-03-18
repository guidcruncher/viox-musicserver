// media-types.ts
export interface MediaItem {
  id: string
  parent?: string
  title: string
  subtitle: string
  img?: string
  artist?: string
  type:
    | "spotify"
    | "radio"
    | "local"
    | "podcast"
    | "artist"
    | "album"
    | "playlist"
    | "episode"
    | string
  uri: string
  format?: string
  isFolder?: boolean
  country?: string
  bitrate?: string
  duration?: number
  favourite?: boolean
}
