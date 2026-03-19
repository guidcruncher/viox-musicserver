import type { MediaItem, MediaSourceRef } from "@/types"

import { makeVioxId } from "./makeVioxId"

export class TuneInNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) {
      throw new Error("TuneInNormalizer: cannot normalize empty object")
    }

    const ref: MediaSourceRef = {
      source: "tunein",
      itemType: "station",
      sourceId: raw.id,
      uri: raw.url,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.text ?? "Unknown Station",
      subtitle: raw.playing ?? raw.subtext ?? "",
      artist: undefined,
      album: undefined,
      imageUrl: raw.image,
      durationMs: undefined,
      isLive: true,
    }
  }
}
