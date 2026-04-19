import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { PassThrough, Readable } from "stream"

import { logger } from "@/logger"

export class AudioStreamService {
  private static instance: AudioStreamService
  private pwProcess: ChildProcessWithoutNullStreams | null = null

  /**
   * The central hub.
   * We set highWaterMark to 16KB (~85ms of audio) to keep latency tight.
   */
  private centralStream: PassThrough = new PassThrough({ highWaterMark: 16384 })
  private consumerCount = 0

  private constructor() {
    // Prevent the central stream from closing if the source process restarts
    this.centralStream.on("error", (err) =>
      logger.error("[AudioStreamService] Central Stream Error:", err),
    )
  }

  public static getInstance(): AudioStreamService {
    if (!AudioStreamService.instance) {
      AudioStreamService.instance = new AudioStreamService()
    }
    return AudioStreamService.instance
  }

  public getAudioStream(): Readable {
    this.consumerCount++

    // Each consumer gets their own PassThrough with a small buffer
    const consumerStream = new PassThrough({ highWaterMark: 16384 })

    this.centralStream.pipe(consumerStream)

    consumerStream.on("close", () => {
      this.centralStream.unpipe(consumerStream)
      this.consumerCount--
      logger.info(`[AudioStreamService] Client left. Active: ${this.consumerCount}`)

      if (this.consumerCount === 0) {
        this.stopPipeWire()
      }
    })

    return consumerStream
  }

  private startPipeWire(): void {
    logger.info("[AudioStreamService] Spawning PipeWire capture...")

    this.pwProcess = spawn("pw-record", [
      "--target",
      "snapcast-sink",
      "--format",
      "s16",
      "--rate",
      "48000",
      "--channels",
      "2",
      "-",
    ])

    this.pwProcess.stdout.on("data", (chunk: Buffer) => {
      // attempt to write to the central hub
      const bufferOk = this.centralStream.write(chunk)

      /**
       * BACKPRESSURE EVASION
       * If write() returns false, the internal buffer is full.
       * We force-read (drain) the hub to drop the old data and prioritize the new 'live' chunk.
       */
      if (!bufferOk) {
        this.centralStream.read()
        // Re-attempt write after clearing space
        this.centralStream.write(chunk)
      }
    })

    this.pwProcess.stderr.on("data", (data) => logger.debug(`[pw-record] ${data}`))
    this.pwProcess.on("error", (err) => logger.error("[AudioStreamService] Spawn Error:", err))
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[AudioStreamService] Killing PipeWire process")
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
