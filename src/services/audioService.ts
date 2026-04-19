import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { logger } from "@/logger"

// Added 'opus' to the union type
type AudioFormat = "aac" | "mp3" | "mp4" | "opus"

interface FormatConfig {
  mimeType: string
  ffmpegArgs: string[]
  primingFrame?: Buffer
}

export class AudioStreamService {
  private readonly configs: Record<AudioFormat, FormatConfig> = {
    opus: {
      mimeType: "audio/ogg", // Standard container for Opus over HTTP
      ffmpegArgs: [
        "-c:a", "libopus",
        "-b:a", "128k",
        "-vbr", "on",
        "-compression_level", "10",
        "-frame_duration", "20",
        "-application", "lowdelay",
        "-f", "opus", // Tells FFmpeg to use the ogg/opus muxer
        "-"
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
        "-c:a", "aac",
        "-b:a", "128k",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "-",
      ],
      primingFrame: undefined,
    },
  }

  public negotiateFormat(queryFormat?: string, accept?: string, ua?: string): AudioFormat {
    logger.debug("Negotiating format")

    if (queryFormat && queryFormat in this.configs) {
      logger.debug(`Using format override from querystring ${queryFormat}`)
      return queryFormat as AudioFormat
    }

    const acceptHeader = accept || ""
    const userAgent = ua || ""

    // Opus is preferred for low-latency if supported (Modern Chrome/Firefox/Edge)
    if (acceptHeader.includes("audio/ogg") || acceptHeader.includes("audio/webm")) {
       // Note: audio/ogg is used by Firefox/Chrome for Opus
       logger.debug("Using opus")
       return "opus"
    }

    if (acceptHeader.includes("audio/mp4")) {
      logger.debug("Using mp4")
      return "mp4"
    }
    
    // ... rest of your negotiation logic
    if (acceptHeader.includes("audio/aac")) return "aac"
    if (acceptHeader.includes("audio/mpeg")) return "mp3"

    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      return "aac"
    }

    return "mp3" 
  }

  // getHeaders, createStream, and stopStream remain the same 
  // as they dynamically use the configs object.
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

    const ffmpeg = spawn("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-nostdin", // Added to prevent Code 255/input hangs
      "-f", "pulse",
      "-i", "snapcast-sink.monitor",
      ...config.ffmpegArgs,
    ], {
      env: { ...process.env } // Ensure PULSE_SERVER is passed
    })

    return { process: ffmpeg, config }
  }

  public stopStream(process: ChildProcessWithoutNullStreams): void {
    if (!process.killed) {
      process.kill("SIGTERM") // SIGTERM is cleaner than SIGKILL for FFmpeg
    }
  }
}
