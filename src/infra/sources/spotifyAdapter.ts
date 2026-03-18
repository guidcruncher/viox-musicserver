import type {
  AudioSourceAdapter,
  BrowseOptions,
  MediaItem,
  MediaSourceRef,
} from "@/types";
import { SpotifyNormalizer } from "@/core/normalizers/spotifyNormalizer";

export class SpotifySourceAdapter implements AudioSourceAdapter {
  readonly id = "spotify";
  private readonly normalize = new SpotifyNormalizer();

  constructor(private readonly client: any /* Spotify Web API client */) {}

  async search(query: string): Promise<MediaItem[]> {
    const raw = await this.client.search(query, [
      "track",
      "album",
      "show",
      "episode",
    ]);

    const items: any[] = [
      ...(raw.tracks?.items ?? []),
      ...(raw.albums?.items ?? []),
      ...(raw.shows?.items ?? []),
      ...(raw.episodes?.items ?? []),
    ];

    return items.map(i => this.normalize.normalize(i));
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    let raw: any;

    switch (ref.itemType) {
      case "track":
        raw = await this.client.getTrack(ref.sourceId);
        break;
      case "album":
        raw = await this.client.getAlbum(ref.sourceId);
        break;
      case "show":
        raw = await this.client.getShow(ref.sourceId);
        break;
      case "episode":
        raw = await this.client.getEpisode(ref.sourceId);
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
    const { ref, kind } = options;

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
    const raw = await this.client.getAlbumTracks(ref.sourceId);
    return raw.items.map((t: any) => this.normalize.normalize(t));
  }

  private async browseShow(ref: MediaSourceRef): Promise<MediaItem[]> {
    const raw = await this.client.getShowEpisodes(ref.sourceId);
    return raw.items.map((e: any) => this.normalize.normalize(e));
  }

  private async browsePlaylist(ref: MediaSourceRef): Promise<MediaItem[]> {
    const raw = await this.client.getPlaylistTracks(ref.sourceId);
    return raw.items
      .filter((i: any) => i.track)
      .map((i: any) => this.normalize.normalize(i.track));
  }
}
