import path from "path"

import { makeVioxId } from "@/core/makeVioxId"
import { SqliteCacheStore } from "@/infra/cacheStore"
import { LocalFileSystemClient } from "@/infra/local/localFileSystemClient"
import { LocalMetadataExtractor } from "@/infra/local/localMetadataExtractor"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class LocalSourceAdapter implements AudioSourceAdapter {
  readonly id = "local"
  readonly caps = Capabilities.audioSources[this.id]
  private readonly store = new SqliteCacheStore()
  private readonly meta = new LocalMetadataExtractor()

  constructor(private fsClient: LocalFileSystemClient) {}

  async getItems(_ref: MediaSourceRef): Promise<MediaItem[] | undefined> {
    return undefined
  }

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const results: MediaItem[] = []
    await this.walk("", async (entry) => {
      if (!entry.isDirectory && entry.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(await this.toMediaItem(entry))
      }
    })
    return results.slice(offset, limit + offset)
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    const fullPath = path.join(this.fsClient["root"], ref.sourceId)
    const entry = {
      id: ref.sourceId,
      name: path.basename(ref.sourceId),
      fullPath,
      isDirectory: false,
      extension: path.extname(ref.sourceId),
    }
    return this.toMediaItem(entry)
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    return ref.uri
    // return path.join(this.fsClient["root"], ref.sourceId)
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    let relPath = ""

    if (options.cursor) {
      relPath = options.cursor
    }

    const entries = await this.fsClient.listDirectory(relPath)

    const items: MediaItem[] = []
    for (const e of entries) {
      items.push(await this.toMediaItem(e))
    }

    await this.store.upsert(items)
    return items.slice(options.offset, (options.offset ?? 0) + (options.limit ?? 20))
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private async toMediaItem(entry: any): Promise<MediaItem> {
    const ref: MediaSourceRef = {
      source: "local",
      itemType: entry.isDirectory ? "folder" : "track",
      sourceId: entry.id,
      uri: entry.fullPath,
    }

    // Folder → no metadata
    if (entry.isDirectory) {
      return {
        id: makeVioxId(ref, "item"),
        sourceRef: ref,
        imageUrl: "/img/folder.png",
        title: entry.name,
        artist: "",
        album: "",
        subtitle: "Folder",
        isLive: false,
      }
    }

    // File → extract metadata
    const meta = await this.meta.extract(entry.fullPath)

    return {
      id: makeVioxId(ref, "item"),
      sourceRef: ref,
      title: meta.title ?? entry.name,
      subtitle: meta.artist ?? entry.extension?.toUpperCase(),
      artist: meta.artist ?? "",
      album: meta.album ?? "",
      imageUrl: "/img/file.png", // cover art handled separately if needed
      durationMs: meta.durationMs,
      isLive: false,
    }
  }

  private async walk(relPath: string, cb: (entry: any) => void | Promise<void>) {
    const entries = await this.fsClient.listDirectory(relPath)

    for (const e of entries) {
      await cb(e)
      if (e.isDirectory) {
        await this.walk(e.id, cb)
      }
    }
  }
}
