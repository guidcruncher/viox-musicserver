import type { MediaItem, MediaItemNormalizer, MediaSourceRef } from "@/types"

import { makeVioxId } from "./makeVioxId"

export class SpotifyNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty Spotify object")

    switch (raw.type) {
      case "track":
        return this.track(raw)
      case "album":
        return this.album(raw)
      case "show":
        return this.show(raw)
      case "episode":
        return this.episode(raw)
      default:
        throw new Error(`Unsupported Spotify item type: ${raw.type}`)
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Track
  // ────────────────────────────────────────────────
  //
  private track(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "spotify",
      itemType: "track",
      sourceId: raw.id,
      parentSourceId: raw.album?.id,
      uri: raw.uri,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name,
      subtitle: raw.album?.name,
      artist: raw.artists?.map((a: any) => a.name).join(", "),
      album: raw.album?.name,
      imageUrl: raw.album?.images?.[0]?.url,
      durationMs: raw.duration_ms,
      isrc: raw.external_ids.isrc ?? "",
      mbid: "",
      isLive: false,
      explicit: raw.explicit,
      releaseDate: raw.album?.release_date,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Album
  // ────────────────────────────────────────────────
  //
  private album(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "spotify",
      itemType: "album",
      sourceId: raw.id,
      uri: raw.uri,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name,
      subtitle: raw.artists?.map((a: any) => a.name).join(", "),
      artist: raw.artists?.map((a: any) => a.name).join(", "),
      album: raw.name,
      imageUrl: raw.images?.[0]?.url,
      durationMs: undefined,
      isLive: false,
      isrc: raw.external_ids.isrc ?? "",
      mbid: "",
      releaseDate: raw.release_date,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Show (Podcast)
  // ────────────────────────────────────────────────
  //
  private show(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "spotify",
      itemType: "show",
      sourceId: raw.id,
      uri: raw.uri,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name,
      subtitle: raw.publisher,
      artist: raw.publisher,
      album: raw.name,
      imageUrl: raw.images?.[0]?.url,
      durationMs: undefined,
      isLive: false,
      mbid: "",
      isrc: "",
      description: raw.description,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Episode
  // ────────────────────────────────────────────────
  //
  private episode(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "spotify",
      itemType: "episode",
      sourceId: raw.id,
      parentSourceId: raw.show?.id,
      uri: raw.uri,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name,
      subtitle: raw.show?.name,
      artist: raw.show?.publisher,
      album: raw.show?.name,
      imageUrl: raw.images?.[0]?.url,
      durationMs: raw.duration_ms,
      isLive: false,
      description: raw.description,
      releaseDate: raw.release_date,
      mbid:"",
      isrc:"",
      explicit: raw.explicit,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Helpers
  // ────────────────────────────────────────────────
  //
}
