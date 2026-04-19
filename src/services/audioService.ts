import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { PassThrough, Readable } from "stream"
import { logger } from "@/logger"

export class AudioStreamService {
  private static instance: AudioService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  
  // A PassThrough stream acts as a central hub (fan-out)
  private centralStream: PassThrough = new PassThrough()
  private consumerCount = 0

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  /**
   * Returns a new readable stream of the raw audio data.
   * Format: PCM S16 LE, 48000Hz, 2 Channels
   */
  public getAudioStream(): Readable {
    this.consumerCount++
    logger.info(`[AudioService] New stream consumer connected. Total: ${this.consumerCount}`)

    if (this.consumerCount === 1) {
      this.startPipeWire()
    }

    // Create a sub-stream for this specific consumer
    const consumerStream = new PassThrough()
    this.centralStream.pipe(consumerStream)

    // Handle cleanup when this specific consumer disconnects/destroys their stream
    consumerStream.on("close", () => {
      this.centralStream.unpipe(consumerStream)
      this.consumerCount--
      logger.info(`[AudioService] Consumer disconnected. Total: ${this.consumerCount}`)
      
      if (this.consumerCount === 0) {
        this.stopPipeWire()
      }
    })

    return consumerStream
  }

  private startPipeWire(): void {
    logger.info("[AudioService] Starting PipeWire 2-channel capture...")

    /**
     * Capturing 2 channels (Stereo)
     * Format: s16 (16-bit Little Endian)
     * Rate: 48000Hz
     */
    this.pwProcess = spawn("pw-record", [
      "--target", "snapcast-sink",
      "--format", "s16",
      "--rate", "48000",
      "--channels", "2",
      "-", // Output to stdout
    ])

    // Pipe the process stdout directly into our central PassThrough stream
    this.pwProcess.stdout.pipe(this.centralStream, { end: false })

    this.pwProcess.on("error", (err) => {
      logger.error("[AudioService] Spawn Error:", err)
    })

    this.pwProcess.stderr.on("data", (data) => {
      logger.debug(`[AudioService] pw-record stderr: ${data}`)
    })
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[AudioService] Stopping PipeWire (No active consumers)")
      // Unpipe first to prevent errors on the central stream
      this.pwProcess.stdout.unpipe(this.centralStream)
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
