import { ChildProcessWithoutNullStreams,spawn } from "child_process"
import { fft, util as fftUtil } from "fft-js"

import { logger } from "@/logger"

export class AudioService {
  private static instance: AudioService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  private listeners: Set<(data: Float32Array) => void> = new Set()

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  public addListener(callback: (data: Float32Array) => void): void {
    this.listeners.add(callback)

    // Start the process only if this is the first listener
    if (this.listeners.size === 1) {
      this.startPipeWire()
    }
  }

  public removeListener(callback: (data: Float32Array) => void): void {
    this.listeners.delete(callback)

    // Kill the process if no one is watching
    if (this.listeners.size === 0) {
      this.stopPipeWire()
    }
  }

  private startPipeWire(): void {
    logger.log("Starting Singleton PipeWire Process...")
    this.pwProcess = spawn("pw-record", [
      "--target",
      "default",
      "--format",
      "s16",
      "--rate",
      "44100",
      "--channels",
      "1",
      "-",
    ])

    this.pwProcess.stdout.on("data", (chunk: Buffer) => {
      const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2)

      if (samples.length >= 1024) {
        const signal = Array.from(samples.slice(0, 1024)).map((n) => n / 32768.0)
        try {
          const phasors = fft(signal)
          const magnitudes = fftUtil.fftMag(phasors)
          const fftData = new Float32Array(magnitudes.slice(0, 64))

          // Broadcast to all connected listeners
          this.listeners.forEach((callback) => callback(fftData))
        } catch (err) {
          // FFT sizing error handling
          loggger.error("Error in FFT cslculator", err)
        }
      }
    })
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.log("No active listeners. Killing PipeWire process.")
      this.pwProcess.kill("SIGKILL")
      this.pwProcess = null
    }
  }
}
