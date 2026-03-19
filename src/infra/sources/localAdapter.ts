import type {
  AudioSourceAdapter,
  MediaItem,
  MediaSourceRef,
  BrowseOptions,
} from "@/types";

import { LocalFileSystemClient } from "@/infra/local/LocalFileSystemClient";
import { LocalMetadataExtractor } from "@/infra/local/LocalMetadataExtractor";
import path from "path";

export class LocalSourceAdapter implements AudioSourceAdapter {
  readonly id = "local";

  private readonly meta = new LocalMetadataExtractor();

  constructor(private fsClient: LocalFileSystemClient) {}

  async search(query: string): Promise<MediaItem[]> {
    const results: MediaItem[] = [];
    await this.walk("", async (entry) => {
      if (!entry.isDirectory && entry.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(await this.toMediaItem(entry));
      }
    });
    return results;
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const fullPath = path.join(this.fsClient["root"], ref.sourceId);
    const entry = {
      id: ref.sourceId,
      name: path.basename(ref.sourceId),
      fullPath,
      isDirectory: false,
      extension: path.extname(ref.sourceId),
    };
    return this.toMediaItem(entry);
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | null> {
    return path.join(this.fsClient["root"], ref.sourceId);
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    const relPath = options.ref?.sourceId ?? "";
    const entries = await this.fsClient.listDirectory(relPath);

    const items: MediaItem[] = [];
    for (const e of entries) {
      items.push(await this.toMediaItem(e));
    }
    return items;
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private async toMediaItem(entry: any): Promise<MediaItem> {
    const ref: MediaSourceRef = {
      source: "local",
      itemType: entry.isDirectory ? "folder" : "file",
      sourceId: entry.id,
      uri: entry.fullPath,
    };

    // Folder → no metadata
    if (entry.isDirectory) {
      return {
        id: `local:${entry.id}`,
        sourceRef: ref,
        title: entry.name,
        subtitle: "Folder",
        isFolder: true,
        isLive: false,
      };
    }

    // File → extract metadata
    const meta = await this.meta.extract(entry.fullPath);

    return {
      id: `local:${entry.id}`,
      sourceRef: ref,
      title: meta.title ?? entry.name,
      subtitle: meta.artist ?? entry.extension?.toUpperCase(),
      artist: meta.artist,
      album: meta.album,
      imageUrl: undefined, // cover art handled separately if needed
      durationMs: meta.durationMs,
      isFolder: false,
      isLive: false,
    };
  }

  private async walk(relPath: string, cb: (entry: any) => void | Promise<void>) {
    const entries = await this.fsClient.listDirectory(relPath);

    for (const e of entries) {
      await cb(e);
      if (e.isDirectory) {
        await this.walk(e.id, cb);
      }
    }
  }
}
