import type { MediaItem, MediaItemNormalizer, MediaSourceRef } from "@/types"

import { makeVioxId } from "../makeVioxId"

export class TuneInNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) {
      throw new Error("TuneInNormalizer: cannot normalize empty object")
    }

    const ref: MediaSourceRef = {
      source: "tunein",
      itemType: raw.type == "audio" ? "station" : "metadata",
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
      imageUrl:
        raw.logo ?? raw.image ?? (ref.itemType == "metadata" ? "/img/folder.png" : undefined),
      durationMs: undefined,
      isLive: true,
    }
  }
}
