import type {
  MediaItem,
  MediaSourceRef,
  MediaItemNormalizer,
} from "@/types";

export class RadioBrowserNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty RadioBrowser object");

    // RadioBrowser always returns stations
    return this.station(raw);
  }

  //
  // ────────────────────────────────────────────────
  //   Station
  // ────────────────────────────────────────────────
  //
  private station(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "radiobrowser",
      itemType: "station",
      sourceId: raw.stationuuid,
      uri: raw.url_resolved ?? raw.url,
    };

    return {
      id: this.buildId(ref),
      sourceRef: ref,
      title: raw.name,
      subtitle: raw.country || raw.language,
      artist: raw.country,
      album: raw.name,
      imageUrl: raw.favicon || undefined,
      durationMs: undefined,
      isLive: true,
      description: raw.tags,
    };
  }

  //
  // ────────────────────────────────────────────────
  //   Helpers
  // ────────────────────────────────────────────────
  //
  private buildId(ref: MediaSourceRef): string {
    return `${ref.source}:${ref.itemType}:${ref.sourceId}:${ref.parentSourceId ?? ""}`;
  }
}
