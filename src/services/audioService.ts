import { ChildProcessWithoutNullStreams, spawn } from "child_process"

import { logger } from "@/logger"

type AudioFormat = "aac" | "mp3" | "mp4"

interface FormatConfig {
  mimeType: string
  ffmpegArgs: string[]
  primingFrame?: Buffer
}

export class AudioStreamService {
  private readonly configs: Record<AudioFormat, FormatConfig> = {
    aac: {
      mimeType: "audio/aac",
      ffmpegArgs: ["-c:a", "aac", "-b:a", "96k", "-f", "adts", "-"],
      // ADTS silent priming frame
      primingFrame: Buffer.from([0xff, 0xf1, 0x50, 0x80, 0x00, 0x1f, 0xfc]),
    },
    mp3: {
      mimeType: "audio/mpeg",
      ffmpegArgs: ["-c:a", "libmp3lame", "-b:a", "128k", "-f", "mp3", "-"],
      // MP3 silent frame
      primingFrame: Buffer.from([
        0xff, 0xfb, 0x90, 0x44, 0x00, 0x00, 0x00, 0x08, 0x00, 0x44, 0x00, 0x00,
      ]),
    },
    mp4: {
      mimeType: "audio/mp4",
      // Fragmented MP4 (fMP4) is required for live streaming over HTTP
      ffmpegArgs: [
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-f",
        "mp4",
        "-movflags",
        "frag_keyframe+empty_moov+default_base_moof",
        "-",
      ],
      primingFrame: undefined, // fMP4 builds its own headers (moov atom)
    },
  }

  /**
   * Logic:
   * 1. Explicit query param (?format=...)
   * 2. Accept Header (MIME type check)
   * 3. User-Agent Fallback (Safari -> AAC, Else -> MP3)
   */
  public negotiateFormat(queryFormat?: string, accept?: string, ua?: string): AudioFormat {
    logger.debug("Negoating format")

    if (queryFormat && queryFormat in this.configs) {
      logger.debug(`Using format override from querystring ${queryFormat}`)
      return queryFormat as AudioFormat
    }

    const acceptHeader = accept || ""
    const userAgent = ua || ""

    if (acceptHeader.includes("audio/mp4")) {
      logger.debug("Using mp4")
      return "mp4"
    }
    if (acceptHeader.includes("audio/aac")) {
      logger.debug("Using aac")
      return "aac"
    }
    if (acceptHeader.includes("audio/mpeg")) {
      logger.debug("Using mp3")
      return "mp3"
    }

    // Fallback based on User Agent
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      logger.debug("Applying Safari override - using aac")
      return "aac"
    }

    logger.debug("Falling back to mp3")
    return "mp3" // The ultimate universal fallback
  }

  public getHeaders(format: AudioFormat) {
    const config = this.configs[format]
    return {
      // Identity & Streaming
      "Content-Type": config.mimeType,
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
      "Accept-Ranges": "none",

      // Cache Busting (Vital for Live)
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",

      // Security & CORS (Universal Compatibility)
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "X-Content-Type-Options": "nosniff",
    }
  }

  public createStream(format: AudioFormat): {
    process: ChildProcessWithoutNullStreams
    config: FormatConfig
  } {
    const config = this.configs[format]

    const ffmpeg = spawn("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "pulse",
      "-i",
      "snapcast-sink.monitor",
      ...config.ffmpegArgs,
    ])

    return { process: ffmpeg, config }
  }

  public stopStream(process: ChildProcessWithoutNullStreams): void {
    if (!process.killed) {
      process.kill("SIGKILL")
    }
  }
}

