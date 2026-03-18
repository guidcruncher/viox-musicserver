import { MediaItem, PlaylistMetadata } from "./index"

export interface SpotifyPlaylistWithItems {
  playlist: PlaylistMetadata;
  items: MediaItem[];
}
