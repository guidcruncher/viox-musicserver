import { MediaItem, MediaSourceRef } from "@/types"

export interface ArtistSource {
  getArtist(name: string): Promise<MediaItem | undefined>
  getArtistAlbums(
    ref: MediaSourceRef,
    offset: number,
    limit: number,
  ): Promise<MediaItem[] | undefined>
  getArtistTracks(
    ref: MediaSourceRef,
    offset: number,
    limit: number,
  ): Promise<MediaItem[] | undefined>
}
