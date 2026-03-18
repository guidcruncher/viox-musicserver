// clients/local/local-file-search.ts

import { promises as fs } from "fs"
import mm from "music-metadata"
import * as path from "path"

import { getConfig } from "@/config"

import { MediaItem } from "../../types/media-types"
import type { BackendSearchClient } from "../search/clients/types"
import type { UnifiedSearchResult } from "../search/types"

interface LocalFileEntry {
  id: string
  uri: string
  path: string
  title: string
  artist?: string
  album?: string
  duration?: number
  artwork?: string
}

export class LocalFileSearch implements BackendSearchClient {
  private index: LocalFileEntry[] = []
  private supportedExtensions = new Set([".mp3", ".flac", ".m4a", ".wav", ".ogg"])

  private toMpdPath(fullPath: string) {
    return fullPath.replace(getConfig("musicFolder") + "/", "")
  }

  async buildIndex(): Promise<void> {
    const files = await this.walk(getConfig("musicFolder"))

    const entries: LocalFileEntry[] = []

    for (const file of files) {
      try {
        const metadata = await mm.parseFile(file, { duration: true })

        const common = metadata.common

        entries.push({
          id: `local:file:${btoa(file)}`, // full path as ID
          uri: this.toMpdPath(file),
          path: file,
          title: common.title ?? path.basename(file),
          artist: common.artist,
          album: common.album,
          duration: metadata.format.duration,
          artwork: this.extractPicture(common.picture),
        })
      } catch (err) {
        console.warn(`Failed to parse metadata for ${file}`, err)
      }
    }

    this.index = entries
  }

  private extractPicture(pictures?: any[]): string {
    if (!pictures || pictures.length === 0) return ""

    const pic = pictures[0]
    const base64 = Buffer.from(pic.data).toString("base64")
    return `data:${pic.format};base64,${base64}`
  }

  private async walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...(await this.walk(fullPath)))
      } else if (this.supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath)
      }
    }

    return files
  }

  async getFileById(id: string): Promise<MediaItem | undefined> {
    const matches = this.index.filter((f) => f.id == id).slice(0, 1)

    if (matches.length == 0) {
      return undefined
    }
    const f = matches[0]
    return {
      id: f.id,
      uri: f.uri,
      type: "local",
      format: "file",
      title: f.title,
      artist: f.artist,
      subtitle: f.album ?? "",
      isFolder: false,
      img: f.artwork,
    }
  }

  async search(query: string, limit: number): Promise<UnifiedSearchResult[]> {
    const q = query.toLowerCase()

    const matches = this.index
      .filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.artist?.toLowerCase().includes(q) ||
          f.album?.toLowerCase().includes(q),
      )
      .slice(0, limit)

    return matches.map((f) => ({
      id: f.id,
      uri: f.uri,
      backend: "local",
      type: "local",
      format: "file",
      title: f.title,
      artist: f.artist,
      album: f.album,
      duration: f.duration,
      artworkUrl: f.artwork,
      meta: {
        titleMatch: f.title.toLowerCase().includes(q),
        path: f.path,
      },
    }))
  }
}
