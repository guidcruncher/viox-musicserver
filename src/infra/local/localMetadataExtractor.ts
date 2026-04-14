import type { IAudioMetadata } from "music-metadata"
import { parseFile } from "music-metadata"

interface LocalAudioMetadata {
  title?: string
  artist?: string
  album?: string
  durationMs?: number
  picture?: { mime: string; data: Buffer } | undefined
  track?: number
  year?: number
  genre?: string[]
}

export class LocalMetadataExtractor {
  async extract(filePath: string): Promise<LocalAudioMetadata> {
    try {
      const meta: IAudioMetadata = await parseFile(filePath, {
        duration: true,
        skipCovers: false,
      })

      const common = meta.common ?? {}
      const picture = common.picture?.[0]

      return {
        title: common.title,
        artist: common.artist,
        album: common.album,
        durationMs: meta.format.duration ? meta.format.duration * 1000 : undefined,
        picture: picture ? { mime: picture.format, data: Buffer.from(picture.data) } : undefined,
        track: common.track?.no || undefined,
        year: common.year,
        genre: common.genre,
      }
    } catch {
      return {}
    }
  }
}
