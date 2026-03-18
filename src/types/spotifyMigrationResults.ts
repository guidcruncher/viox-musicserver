import { MediaItem, SpotifyPlaylistWithItems } from "./index"

export interface SpotifyLibraryMigrationResult {
  playlists: SpotifyPlaylistWithItems[];
  likedTracks: MediaItem[]; // optional: if you want to import "Liked Songs"
  likedAlbums: MediaItem[]; // optional
  likedShows: MediaItem[];  // optional
  likedEpisodes: MediaItem[]; // optional
}
