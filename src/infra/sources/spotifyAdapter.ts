import type {
  AudioSourceAdapter,
  MediaItem,
  MediaSourceRef,
  BrowseOptions,
} from "@/types";

import { SpotifyWebClient } from "@/infra/spotify/SpotifyWebClient";
import { SpotifyNormalizer } from "@/core/normalizers/spotify-normalizer";

export class SpotifySourceAdapter implements AudioSourceAdapter {
  readonly id = "spotify";

  private readonly api = new SpotifyWebClient();
  private readonly normalize = new SpotifyNormalizer();

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.api.search(query, [
      "track",
      "album",
      "show",
      "episode",
      "playlist",
    ]);

    const items: any[] = [
      ...(raw.tracks?.items ?? []),
      ...(raw.albums?.items ?? []),
      ...(raw.shows?.items ?? []),
      ...(raw.episodes?.items ?? []),
      ...(raw.playlists?.items ?? []),
    ];

    return items.map((i) => this.normalize.normalize(i));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    let raw: any;

    switch (ref.itemType) {
      case "track":
        raw = await this.api.getTrack(ref.sourceId);
        break;
      case "album":
        raw = await this.api.getAlbum(ref.sourceId);
        break;
      case "show":
        raw = await this.api.getShow(ref.sourceId);
        break;
      case "episode":
        raw = await this.api.getEpisode(ref.sourceId);
        break;
      case "playlist":
        raw = await this.api.getPlaylist(ref.sourceId);
        break;
      default:
        return null;
    }

    return this.normalize.normalize(raw);
  }

  async getPlaybackUrl(): Promise<string | null> {
    return null; // Spotify uses SDK, not URLs
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    const { ref } = options;
    if (!ref) return [];

    switch (ref.itemType) {
      case "album":
        return this.browseAlbum(ref);
      case "show":
        return this.browseShow(ref);
      case "playlist":
        return this.browsePlaylist(ref);
      default:
        return [];
    }
  }

  private async browseAlbum(ref: MediaSourceRef): Promise<MediaItem[]> {
    const raw = await this.api.getAlbumTracks(ref.sourceId);
    return raw.items.map((t: any) => this.normalize.normalize(t));
  }

  private async browseShow(ref: MediaSourceRef): Promise<MediaItem[]> {
    const raw = await this.api.getShowEpisodes(ref.sourceId);
    return raw.items.map((e: any) => this.normalize.normalize(e));
  }

  private async browsePlaylist(ref: MediaSourceRef): Promise<MediaItem[]> {
    const raw = await this.api.getPlaylistTracks(ref.sourceId);
    return raw.items
      .filter((i: any) => i.track)
      .map((i: any) => this.normalize.normalize(i.track));
  }
}
