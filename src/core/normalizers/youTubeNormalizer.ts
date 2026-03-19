import type { MediaItem, MediaSourceRef, MediaItemNormalizer } from "@/types"
import { makeVioxId } from "./makeVioxId"

export class YouTubeMusicNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty YouTube Music object")

    // ytmusicapi uses "videoType" or "resultType"
    const type = raw.videoType || raw.resultType || raw.type

    switch (type) {
      case "song":
      case "track":
        return this.song(raw)

      case "video":
        return this.video(raw)

      case "album":
        return this.album(raw)

      default:
        throw new Error(`Unsupported YouTube Music item type: ${type}`)
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Song / Track
  // ────────────────────────────────────────────────
  //
  private song(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "youtube",
      itemType: "track",
      sourceId: raw.videoId,
      parentSourceId: raw.album?.id,
      uri: `https://music.youtube.com/watch?v=${raw.videoId}`,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: raw.title,
      subtitle: raw.album?.name,
      artist: raw.artists?.map((a: any) => a.name).join(", "),
      album: raw.album?.name,
      imageUrl: raw.thumbnails?.[0]?.url,
      durationMs: raw.duration_seconds ? raw.duration_seconds * 1000 : undefined,
      isLive: false,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Video (treated as track)
  // ────────────────────────────────────────────────
  //
  private video(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "youtube",
      itemType: "track",
      sourceId: raw.videoId,
      uri: `https://music.youtube.com/watch?v=${raw.videoId}`,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: raw.title,
      subtitle: raw.author,
      artist: raw.author,
      album: raw.title,
      imageUrl: raw.thumbnails?.[0]?.url,
      durationMs: raw.duration_seconds ? raw.duration_seconds * 1000 : undefined,
      isLive: false,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Album
  // ────────────────────────────────────────────────
  //
  private album(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "youtube",
      itemType: "album",
      sourceId: raw.browseId,
      uri: `https://music.youtube.com/browse/${raw.browseId}`,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: raw.title,
      subtitle: raw.artist,
      artist: raw.artist,
      album: raw.title,
      imageUrl: raw.thumbnails?.[0]?.url,
      isLive: false,
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Helpers
  // ────────────────────────────────────────────────
  //
}
