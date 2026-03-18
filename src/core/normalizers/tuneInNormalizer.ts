import type {
  MediaItem,
  MediaSourceRef,
  MediaItemNormalizer,
} from "@/types";

export class TuneInNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty TuneIn object");

    // TuneIn uses "Type" or "type"
    const type = raw.Type || raw.type;

    switch (type) {
      case "Station":
      case "station":
        return this.station(raw);

      case "Show":
      case "show":
        return this.show(raw);

      default:
        throw new Error(`Unsupported TuneIn item type: ${type}`);
    }
  }

  //
  // ────────────────────────────────────────────────
  //   Station
  // ────────────────────────────────────────────────
  //
  private station(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "tunein",
      itemType: "station",
      sourceId: raw.GuideId || raw.id,
      uri: raw.Url || raw.StreamUrl,
    };

    return {
      id: this.buildId(ref),
      sourceRef: ref,
      title: raw.Title || raw.name,
      subtitle: raw.Subtitle || raw.Description,
      artist: raw.Subtitle || raw.Description,
      album: raw.Title || raw.name,
      imageUrl: raw.Image || raw.Logo,
      durationMs: undefined,
      isLive: true,
      description: raw.Description,
    };
  }

  //
  // ────────────────────────────────────────────────
  //   Show
  // ────────────────────────────────────────────────
  //
  private show(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "tunein",
      itemType: "show",
      sourceId: raw.GuideId || raw.id,
      uri: raw.Url,
    };

    return {
      id: this.buildId(ref),
      sourceRef: ref,
      title: raw.Title,
      subtitle: raw.Subtitle,
      artist: raw.Subtitle,
      album: raw.Title,
      imageUrl: raw.Image,
      durationMs: undefined,
      isLive: false,
      description: raw.Description,
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
