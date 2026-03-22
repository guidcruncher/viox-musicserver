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
      sourceId: raw.guide_id,
      uri: "",
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.text ?? "Unknown Station",
      subtitle: raw.subtext ?? "",
      artist: raw.url ?? "",
      album: undefined,
      imageUrl: raw.logo ?? raw.image,
      durationMs: undefined,
      isLive: true,
    }
  }
}
