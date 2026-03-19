import type { MediaItem, MediaSourceRef } from "@/types"

import { makeVioxId } from "./makeVioxId"

export class PodverseNormalizer {
  normalize(raw: any): MediaItem {
    if (!raw) {
      throw new Error("PodverseNormalizer: cannot normalize empty object")
    }

    // MediaRef (clips)
    if ("startTime" in raw) {
      return this.fromMediaRef(raw)
    }

    // Episode (API or RSS)
    if ("mediaUrl" in raw) {
      return this.fromEpisode(raw)
    }

    // Podcast
    if ("feedUrls" in raw || raw.type === "podcast") {
      return this.fromPodcast(raw)
    }

    throw new Error(`PodverseNormalizer: unsupported object type`)
  }

  // ────────────────────────────────────────────────
  // Podcast
  // ────────────────────────────────────────────────
  private fromPodcast(podcast: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "podverse",
      itemType: "podcast",
      sourceId: podcast.id,
      uri: podcast.feedUrls?.[0]?.url ?? podcast.linkUrl ?? "",
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: podcast.title ?? "Untitled Podcast",
      subtitle: podcast.description ?? "",
      artist: podcast.authors?.map((a: any) => a.name).join(", "),
      album: undefined,
      imageUrl: podcast.imageUrl,
      durationMs: undefined,
      isLive: false,
    }
  }

  // ────────────────────────────────────────────────
  // Episode (API or RSS)
  // ────────────────────────────────────────────────
  private fromEpisode(ep: any): MediaItem {
    const podcastId = ep.podcast?.id ?? ep.podcastId ?? this.extractPodcastIdFromEpisodeId(ep.id)

    const ref: MediaSourceRef = {
      source: "podverse",
      itemType: "episode",
      sourceId: ep.id,
      parentSourceId: podcastId,
      uri: ep.mediaUrl,
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: ep.title ?? "Untitled Episode",
      subtitle: ep.description ?? "",
      artist: ep.podcast?.title,
      album: ep.podcast?.title,
      imageUrl: ep.imageUrl ?? ep.podcast?.imageUrl,
      durationMs: ep.duration ? ep.duration * 1000 : undefined,
      isLive: false,
    }
  }

  // ────────────────────────────────────────────────
  // MediaRef (clips)
  // ────────────────────────────────────────────────
  private fromMediaRef(refObj: any): MediaItem {
    const episode = refObj.episode
    const podcast = refObj.podcast

    const ref: MediaSourceRef = {
      source: "podverse",
      itemType: "mediaref",
      sourceId: refObj.id,
      parentSourceId: episode?.id,
      uri: this.buildMediaRefUri(refObj),
    }

    return {
      id: makeVioxId(ref),
      sourceRef: ref,
      title: refObj.title ?? episode?.title ?? "Untitled Clip",
      subtitle: refObj.description ?? episode?.description ?? "",
      artist: podcast?.title,
      album: podcast?.title,
      imageUrl: episode?.imageUrl ?? podcast?.imageUrl,
      durationMs: undefined,
      isLive: false,
    }
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────

  private buildMediaRefUri(ref: any): string {
    const episodeId = ref.episode?.id ?? "unknown"
    const start = ref.startTime ?? 0
    return `mediaref:${ref.id}:episode:${episodeId}:start:${start}`
  }

  private extractPodcastIdFromEpisodeId(id: string): string | undefined {
    // Example: podverse:episode:123 → 123
    if (!id) return undefined
    const parts = id.split(":")
    return parts.length >= 3 ? parts[2] : undefined
  }
}
