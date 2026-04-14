import { Parser } from "m3u8-parser"

import { MediaItem, MediaSourceRef } from "@/types"
import { AudioSource, AudioSourceItemType } from "@/types"

import { makeVioxId } from "../makeVioxId"

export class M3U8playlistNormalizer {
  /**
   * Convert an M3U/M3U8 playlist string into MediaItem objects.
   */
  static async convert(playlistText: string, source: AudioSource = "stream"): Promise<MediaItem[]> {
    const parsed = this.parseM3U8(playlistText)

    return parsed.map((entry) => {
      const url = entry.uri

      const title =
        entry.tvg?.name || entry.tvg?.displayName || entry.title || this.deriveTitleFromUrl(url)

      const durationMs =
        typeof entry.duration === "number" && entry.duration >= 0
          ? entry.duration * 1000
          : undefined

      const sourceRef: MediaSourceRef = {
        source,
        itemType: "station" as AudioSourceItemType,
        sourceId: url,
        uri: url,
      }

      const id = makeVioxId(sourceRef, "item")

      const item: MediaItem = {
        id,
        sourceRef,
        title,
        durationMs,
        isLive: true,
      }

      if (entry.tvg.logo) {
        item.imageUrl = `/${entry.tvg?.logo}`
      }

      return item
    })
  }

  /**
   * Parse HLS playlists + IPTV metadata.
   */
  private static parseM3U8(text: string) {
    const parser = new Parser()
    parser.push(text)
    parser.end()

    const manifest = parser.manifest
    const tvgMap = this.extractTvgMetadata(text)

    // MASTER PLAYLIST
    if (manifest.playlists?.length) {
      return manifest.playlists.map((p) => {
        const uri = decodeURIComponent(p.uri)
        return {
          uri,
          title: p.attributes?.NAME,
          duration: undefined,
          tvg: tvgMap[uri],
        }
      })
    }

    // MEDIA PLAYLIST
    if (manifest.segments?.length) {
      return manifest.segments.map((s) => {
        const uri = decodeURIComponent(s.uri)
        return {
          uri,
          title: s.title,
          duration: s.duration,
          tvg: tvgMap[uri],
        }
      })
    }

    return []
  }

  /**
   * Extract IPTV-style tvg-* attributes from EXTINF lines.
   */
  private static extractTvgMetadata(text: string) {
    const lines = text.split(/\r?\n/)
    const map: Record<string, any> = {}

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line.startsWith("#EXTINF")) continue

      const next = lines[i + 1]?.trim()
      if (!next || next.startsWith("#")) continue

      const uri = decodeURIComponent(next)
      const attrs: any = {}

      // Extract tvg-* attributes
      const attrRegex = /(\w[\w-]*)="([^"]*)"/g
      let match

      while ((match = attrRegex.exec(line))) {
        const key = match[1]
        const value = match[2]

        if (key.startsWith("tvg-")) {
          attrs[key.replace("tvg-", "")] = value
        }

        if (key === "group-title") {
          attrs.group = value
        }
      }

      // Extract display name after comma
      const commaIndex = line.indexOf(",")
      if (commaIndex !== -1) {
        const displayName = line.substring(commaIndex + 1).trim()
        if (displayName) attrs.displayName = displayName
      }

      map[uri] = attrs
    }

    return map
  }

  private static deriveTitleFromUrl(url: string): string {
    try {
      const u = new URL(url)
      return u.hostname.replace(/^www\./, "")
    } catch {
      return url
    }
  }
}
