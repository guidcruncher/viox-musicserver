import type {
  AudioSourceAdapter,
  MediaItem,
  MediaSourceRef,
  BrowseOptions,
} from "@/types";

import { LocalFileSystemClient } from "@/infra/local/LocalFileSystemClient";
import path from "path";

export class LocalSourceAdapter implements AudioSourceAdapter {
  readonly id = "local";

  constructor(private fsClient: LocalFileSystemClient) {}

  async search(query: string): Promise<MediaItem[]> {
    // Local FS search = simple recursive scan
    const results: MediaItem[] = [];
    await this.walk("", (entry) => {
      if (!entry.isDirectory && entry.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(this.toMediaItem(entry));
      }
    });
    return results;
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | null> {
    const entry = {
      id: ref.sourceId,
      name: path.basename(ref.sourceId),
      fullPath: path.join(this.fsClient["root"], ref.sourceId),
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

    return entries.map((e) => this.toMediaItem(e));
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private toMediaItem(entry: any): MediaItem {
    const ref: MediaSourceRef = {
      source: "local",
      itemType: entry.isDirectory ? "folder" : "file",
      sourceId: entry.id,
      uri: entry.fullPath,
    };

    return {
      id: `local:${entry.id}`,
      sourceRef: ref,
      title: entry.name,
      subtitle: entry.isDirectory ? "Folder" : entry.extension?.toUpperCase(),
      artist: undefined,
      album: undefined,
      imageUrl: undefined,
      durationMs: undefined,
      isLive: false,
      isFolder: entry.isDirectory,
    };
  }

  private async walk(relPath: string, cb: (entry: any) => void) {
    const entries = await this.fsClient.listDirectory(relPath);

    for (const e of entries) {
      cb(e);
      if (e.isDirectory) {
        await this.walk(e.id, cb);
      }
    }
  }
}
