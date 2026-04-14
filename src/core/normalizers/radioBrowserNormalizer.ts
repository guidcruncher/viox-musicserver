import type { MediaItem, MediaItemNormalizer, MediaSourceRef } from "@/types"

import { makeVioxId } from "../makeVioxId"

export class RadioBrowserNormalizer implements MediaItemNormalizer {
  normalizeCountry(raw: any): MediaItem {
    if (!raw) {
      throw new Error("RadioBrowserNormalizer: cannot normalize empty object")
    }

    const ref: MediaSourceRef = {
      source: "radiobrowser",
      itemType: "metadata",
      sourceId: raw.code,
      uri: raw.code,
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name,
      subtitle: "",
      artist: "",
      album: undefined,
      imageUrl: "/img/folder.png",
      durationMs: undefined,
      isLive: false,
    }
  }

  normalize(raw: any): MediaItem {
    if (!raw) {
      throw new Error("RadioBrowserNormalizer: cannot normalize empty object")
    }

    const ref: MediaSourceRef = {
      source: "radiobrowser",
      itemType: "station",
      sourceId: raw.stationuuid,
      uri: "",
    }

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: raw.name ?? "Unknown Station",
      subtitle: raw.tags?.split(",").slice(0, 3).join(", ") ?? "",
      artist: "",
      album: undefined,
      imageUrl: raw.favicon || undefined,
      durationMs: undefined,
      isLive: true,
    }
  }
}
