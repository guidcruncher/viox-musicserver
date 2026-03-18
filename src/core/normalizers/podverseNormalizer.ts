import type {
  MediaItem,
  MediaSourceRef,
  MediaItemNormalizer,
} from "@/types";

export class PodverseNormalizer implements MediaItemNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) throw new Error("Cannot normalize empty Podverse object");

    if (raw.type === "podcast") return this.podcast(raw);
    if (raw.type === "episode") return this.episode(raw);

    throw new Error(`Unsupported Podverse item type: ${raw.type}`);
  }

  //
  // ────────────────────────────────────────────────
  //   Podcast
  // ────────────────────────────────────────────────
  //
  private podcast(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "podverse",
      itemType: "podcast",
      sourceId: raw.id,
      uri: raw.url ?? undefined,
    };

    return {
      id: this.buildId(ref),
      sourceRef: ref,
      title: raw.title,
      subtitle: raw.author,
      artist: raw.author,
      album: raw.title,
      imageUrl: raw.imageUrl,
      durationMs: undefined,
      isLive: false,
      description: raw.description,
    };
  }

  //
  // ────────────────────────────────────────────────
  //   Episode
  // ────────────────────────────────────────────────
  //
  private episode(raw: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "podverse",
      itemType: "episode",
      sourceId: raw.id,
      parentSourceId: raw.podcastId,
      uri: raw.url ?? undefined,
    };

    return {
      id: this.buildId(ref),
      sourceRef: ref,
      title: raw.title,
      subtitle: raw.podcastTitle,
      artist: raw.podcastAuthor,
      album: raw.podcastTitle,
      imageUrl: raw.imageUrl,
      durationMs: raw.duration,
      isLive: false,
      description: raw.description,
      releaseDate: raw.publishedAt,
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
