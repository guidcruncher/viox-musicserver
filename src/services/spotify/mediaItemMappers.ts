// src/services/spotify/MediaItemMapper.ts
import type { MediaItem } from "../../types/media-types"

export const MediaItemMapper = {
  fromTrack(track: any): MediaItem | undefined {
    if (!track) return undefined

    return {
      id: track.uri,
      title: track.name,
      subtitle: track.artists?.map((a: any) => a.name).join(", ") ?? "",
      img: track.album?.images?.[0]?.url,
      artist: track.artists?.[0]?.name,
      type: "track",
      uri: track.uri,
      format: "spotify",
      duration: track.duration_ms / 1000,
      isFolder: false,
    }
  },

  fromAlbum(album: any): MediaItem | undefined {
    if (!album) return undefined

    return {
      id: album.uri,
      title: album.name,
      subtitle: album.artists?.map((a: any) => a.name).join(", ") ?? "",
      img: album.images?.[0]?.url,
      artist: album.artists?.[0]?.name,
      type: "album",
      uri: album.uri,
      format: "spotify",
      isFolder: false,
    }
  },

  fromPlaylist(playlist: any): MediaItem | undefined {
    if (!playlist) return undefined

    return {
      id: playlist.uri,
      title: playlist.name,
      subtitle: playlist.description || "",
      img: playlist.images?.[0]?.url,
      type: "playlist",
      format: "spotify",
      uri: playlist.uri,
      isFolder: false,
    }
  },

  fromEpisode(ep: any): MediaItem | undefined {
    if (!ep) return undefined

    return {
      id: ep.uri,
      title: ep.name,
      subtitle: ep.show?.name ?? "",
      img: ep.images?.[0]?.url,
      artist: ep.show?.publisher,
      type: "episode",
      uri: ep.uri,
      format: "spotify",
      isFolder: false,
      duration: ep.duration / 1000,
    }
  },

  fromArtist(artist: any): MediaItem | undefined {
    if (!artist) return undefined

    return {
      id: artist.uri,
      title: artist.name,
      subtitle: artist.genres?.join(", ") ?? "",
      img: artist.images?.[0]?.url,
      type: "artist",
      uri: artist.uri,
      format: "spotify",
      isFolder: false,
    }
  },

  fromAny(item: any): MediaItem | undefined {
    if (!item) return undefined

    switch (item.type) {
      case "track":
        return this.fromTrack(item)
      case "album":
        return this.fromAlbum(item)
      case "playlist":
        return this.fromPlaylist(item)
      case "episode":
        return this.fromEpisode(item)
      case "artist":
        return this.fromArtist(item)
      default:
        return undefined
    }
  },
}
