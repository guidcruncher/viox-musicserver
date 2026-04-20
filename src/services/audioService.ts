import { ChildProcessWithoutNullStreams, spawn } from "child_process"

import { logger } from "@/logger"

// Audio formats - listed in order of increasing CPU load (generally) and quality (generally)
type AudioFormat = "pcm" | "mp3" | "flac" | "aac" | "mp4" | "opus"

interface FormatConfig {
  mimeType: string
  ffmpegArgs: string[]
  primingFrame?: Buffer
}

export class AudioStreamService {
  public static getAudioFormatsSupported(): string[] {
    const cpuOrder: AudioFormat[] = ["pcm", "mp3", "flac", "aac", "mp4", "opus"]
    return cpuOrder as string[]
  }

  private readonly configs: Record<AudioFormat, FormatConfig> = {
    opus: {
      mimeType: "audio/ogg",
      ffmpegArgs: [
        "-c:a",
        "libopus",
        "-b:a",
        "128k",
        "-vbr",
        "on",
        "-compression_level",
        "10",
        "-frame_duration",
        "20",
        "-application",
        "lowdelay",
        "-f",
        "opus",
        "-",
      ],
      primingFrame: undefined,
    },

    aac: {
      mimeType: "audio/aac",
      ffmpegArgs: ["-c:a", "aac", "-b:a", "96k", "-f", "adts", "-"],
      primingFrame: Buffer.from([0xff, 0xf1, 0x50, 0x80, 0x00, 0x1f, 0xfc]),
    },

    mp3: {
      mimeType: "audio/mpeg",
      ffmpegArgs: ["-c:a", "libmp3lame", "-b:a", "128k", "-f", "mp3", "-"],
      primingFrame: Buffer.from([
        0xff, 0xfb, 0x90, 0x44, 0x00, 0x00, 0x00, 0x08, 0x00, 0x44, 0x00, 0x00,
      ]),
    },

    mp4: {
      mimeType: "audio/mp4",
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
      primingFrame: undefined,
    },

    pcm: {
      mimeType: "audio/L16",
      ffmpegArgs: ["-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", "-f", "s16le", "-"],
      primingFrame: undefined,
    },

    flac: {
      mimeType: "audio/flac",
      ffmpegArgs: [
        "-c:a",
        "flac",
        "-compression_level",
        "5", // Balanced CPU vs size
        "-ar",
        "48000",
        "-ac",
        "2",
        "-f",
        "flac",
        "-",
      ],
      primingFrame: undefined,
    },
  }

  public negotiateFormat(queryFormat?: string, accept?: string, ua?: string): AudioFormat {
    logger.debug("Negotiating format")

    // 1. Explicit override always wins
    if (queryFormat && queryFormat in this.configs) {
      logger.debug(`Using format override from querystring ${queryFormat}`)
      return queryFormat as AudioFormat
    }

    const acceptHeader = accept || ""
    const userAgent = ua || ""

    // 2. CPU‑ordered preference list (lowest → highest)
    const cpuOrder: AudioFormat[] = ["pcm", "mp3", "flac", "aac", "mp4", "opus"]

    // 3. Map formats to MIME indicators
    const mimeMatches: Record<AudioFormat, string[]> = {
      pcm: ["audio/L16", "audio/raw"],
      mp3: ["audio/mpeg"],
      flac: ["audio/flac"],
      aac: ["audio/aac"],
      mp4: ["audio/mp4"],
      opus: ["audio/ogg", "audio/webm"],
    }

    // 4. Try to match Accept header in CPU‑efficient order
    for (const format of cpuOrder) {
      const mimes = mimeMatches[format]
      if (mimes.some((m) => acceptHeader.includes(m))) {
        logger.debug(`Selected ${format} based on Accept header`)
        return format
      }
    }

    // 5. Safari fallback (AAC)
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      logger.debug("Safari detected, using AAC")
      return "aac"
    }

    // 6. Default to lowest CPU format
    logger.debug("No match found, defaulting to pcm")
    return "pcm"
  }

  public getHeaders(format: AudioFormat) {
    const config = this.configs[format]
    return {
      "Content-Type": config.mimeType,
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
      "Accept-Ranges": "none",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
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

    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-nostdin",
        "-f",
        "pulse",
        "-i",
        "snapcast-sink.monitor",
        ...config.ffmpegArgs,
      ],
      {
        env: { ...process.env },
      },
    )

    return { process: ffmpeg, config }
  }

  public stopStream(process: ChildProcessWithoutNullStreams): void {
    if (!process.killed) {
      process.kill("SIGTERM")
    }
  }
}
