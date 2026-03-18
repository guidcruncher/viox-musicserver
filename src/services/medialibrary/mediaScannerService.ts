import { promises as fs } from "fs"
import { parseFile } from "music-metadata"
import * as path from "path"

import { getConfig } from "@/config"

import { MediaItem } from "../../types/media-types"

class MediaScannerService {
  private root: string
  private cache: MediaItem[] = []
  private supported = new Set([".mp3", ".flac", ".wav", ".m4a", ".ogg"])

  constructor(rootFolder: string) {
    this.root = rootFolder
  }

  /** ------------------------------------------------------------------ */
  /** Public API */
  /** ------------------------------------------------------------------ */

  async scanFolder(): Promise<MediaItem[]> {
    this.cache = await this.walk(this.root)
    return this.cache
  }

  async getById(id: string | number): Promise<MediaItem | undefined> {
    if (this.cache.length === 0) {
      await this.scanFolder()
    }
    return this.cache.find((item) => item.id === id)
  }

  async search(query: string): Promise<MediaItem[]> {
    if (this.cache.length === 0) {
      await this.scanFolder()
    }

    const q = query.toLowerCase()
    return this.cache.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.artist && item.artist.toLowerCase().includes(q)),
    )
  }

  /** ------------------------------------------------------------------ */
  /** Internal recursive walker */
  /** ------------------------------------------------------------------ */

  private async walk(dir: string): Promise<MediaItem[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const results: MediaItem[] = []

    for (const entry of entries) {
      const full = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        const nested = await this.walk(full)
        results.push(...nested)
        continue
      }

      const ext = path.extname(entry.name).toLowerCase()
      if (!this.supported.has(ext)) continue

      const item = await this.buildMediaItem(full, ext)
      results.push(item)
    }

    return results
  }

  /** ------------------------------------------------------------------ */
  /** Build a MediaItem with metadata + Base64 artwork */
  /** ------------------------------------------------------------------ */
  private getFileNameWithoutExtension(filePath: string): string {
    const base = path.basename(filePath) // "Dayvan Cowboy.mp3"
    const ext = path.extname(base) // ".mp3"
    return base.slice(0, base.length - ext.length)
  }

  private async buildMediaItem(fullPath: string, ext: string): Promise<MediaItem> {
    let metadata
    try {
      metadata = await parseFile(fullPath)
    } catch {
      metadata = undefined
    }

    const id = Buffer.from(fullPath).toString("base64")

    if (!metadata) {
      return {
        id: `local:file:${id}`,
        title: this.getFileNameWithoutExtension(fullPath),
        subtitle: "",
        artist: "",
        type: "local",
        uri: this.toMpdPath(fullPath),
        format: ext.replace(".", ""),
        bitrate: "",
        img: "",
        isFolder: false,
      }
    } else {
      const common = metadata.common ?? {}
      const format = metadata.format ?? {}

      const title = common.title || path.basename(fullPath, ext)

      const artist =
        common.artist || (Array.isArray(common.artists) ? common.artists.join(", ") : undefined)

      const album = common.album || ""

      const bitrate = format.bitrate ? `${Math.round(format.bitrate / 1000)} kbps` : undefined

      let img = undefined
      if (common.picture) img = `/api/local/img/${id}`

      return {
        id: `local:file:${id}`,
        title,
        subtitle: album || "",
        artist,
        type: "local",
        uri: this.toMpdPath(fullPath),
        format: ext.replace(".", ""),
        bitrate,
        img,
        isFolder: false,
      }
    }
  }

  /** ------------------------------------------------------------------ */
  /** Convert embedded artwork to Base64 data URI */
  /** ------------------------------------------------------------------ */
  private toMpdPath(fullPath: string) {
    return fullPath.replace(this.root + "/", "")
  }
}

export const mediaScannerService = new MediaScannerService(getConfig("musicFolder"))
