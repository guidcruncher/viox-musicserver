import type { MediaItem, MediaSourceRef } from "@/types"
import { makeVioxId } from "./makeVioxId"

export class RadioBrowserNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) {
      throw new Error("RadioBrowserNormalizer: cannot normalize empty object")
    }

    const ref: MediaSourceRef = {
      source: "radiobrowser",
      itemType: "station",
      sourceId: raw.stationuuid,
      uri: raw.url_resolved ?? raw.url,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: raw.name ?? "Unknown Station",
      subtitle: raw.tags?.split(",").slice(0, 3).join(", ") ?? "",
      artist: "",
      album: undefined,
      imageUrl: raw.favicon || undefined,
      durationMs: undefined,
      isLive: true,
      country: raw.countrycode,
      bitrate: raw.bitrate ? `${raw.bitrate}` : undefined,
    }
  }
}
