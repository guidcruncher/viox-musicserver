import type { MediaItem, MediaSourceRef, MediaItemNormalizer } from "@/types"
import { makeVioxId } from "./makeVioxId"

export class LocalFileNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty local file object")

    const ref: MediaSourceRef = {
      source: "local",
      itemType: "track",
      sourceId: raw.path, // full path or hashed path
      uri: raw.path,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: raw.title || raw.filename,
      subtitle: raw.album,
      artist: raw.artist,
      album: raw.album,
      imageUrl: raw.coverArtPath,
      durationMs: raw.durationMs,
      isLive: false,
    }
  }
}
