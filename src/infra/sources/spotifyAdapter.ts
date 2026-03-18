import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";

export class SpotifySourceAdapter implements AudioSourceAdapter {
  readonly id = "spotify";

  // TODO: inject Spotify Web API client
  constructor(/* spotifyClient */) {}

  async search(query: string): Promise<MediaItem[]> {
    // TODO: call Spotify search API
    return [];
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    // TODO: fetch track/album/show/episode
    return null;
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    // Spotify playback is handled by SDK, not URL
    return null;
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    // TODO: implement playlists, albums, shows, etc.
    return [];
  }
}

export spotifySourceAdapter = (async ()=>  { return new SpotifySourceAdapter() })
