import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import FFT from "fft.js"

import { logger } from "@/logger"

export class FFTStreamService {
  private static instance: FFTStreamService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  private listeners: Set<(data: Float32Array) => void> = new Set()
  private fft = new FFT(1024)

  // --- Throttling & Smoothing State ---
  private lastEmitTime = 0
  private readonly EMIT_INTERVAL_MS = 33 // Target ~30fps to save browser CPU
  private peakMagnitudes = new Float32Array(64)
  // ------------------------------------

  private constructor() {}

  public static getInstance(): FFTStreamService {
    if (!FFTStreamService.instance) {
      FFTStreamService.instance = new FFTStreamService()
    }
    return FFTStreamService.instance
  }

  public addListener(callback: (data: Float32Array) => void): void {
    this.listeners.add(callback)
    logger.info(`[FFTStreamService] Client connected. Total: ${this.listeners.size}`)
    if (this.listeners.size === 1) this.startPipeWire()
  }

  public removeListener(callback: (data: Float32Array) => void): void {
    this.listeners.delete(callback)
    logger.info(`[FFTStreamService] Client disconnected. Total: ${this.listeners.size}`)
    if (this.listeners.size === 0) this.stopPipeWire()
  }

  private startPipeWire(): void {
    logger.info("[FFTStreamService] Starting PipeWire capture...")

    this.pwProcess = spawn("pw-record", [
      "--target",
      "snapcast-sink",
      "--format",
      "s16",
      "--rate",
      "48000",
      "--channels",
      "1",
      "-",
    ])

    this.pwProcess.stdout.on("data", (chunk: Buffer) => {
      try {
        const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2)

        // Process audio in 1024 sample chunks
        if (samples.length >= 1024) {
          const input = new Float32Array(1024)
          for (let i = 0; i < 1024; i++) {
            input[i] = samples[i] / 32768.0
          }

          const out = this.fft.createComplexArray()
          this.fft.realTransform(out, input)

          /**
           * PEAK DETECTION:
           * We update our local peakMagnitudes array with the highest values
           * found in this specific audio chunk.
           */
          for (let i = 0; i < 64; i++) {
            const real = out[i * 2]
            const imag = out[i * 2 + 1]
            const mag = Math.sqrt(real * real + imag * imag)

            if (mag > this.peakMagnitudes[i]) {
              this.peakMagnitudes[i] = mag
            }
          }

          /**
           * THROTTLE CHECK:
           * Only broadcast to listeners if the EMIT_INTERVAL has passed.
           */
          const now = Date.now()
          if (now - this.lastEmitTime >= this.EMIT_INTERVAL_MS) {
            const NOISE_THRESHOLD = 0.012
            const outputBuffer = new Float32Array(64)

            for (let i = 0; i < 64; i++) {
              const val = this.peakMagnitudes[i]
              outputBuffer[i] = val < NOISE_THRESHOLD ? 0 : (val - NOISE_THRESHOLD) * 1.5
            }

            // Send the aggregated peaks to clients
            this.listeners.forEach((cb) => cb(outputBuffer))

            // Reset tracking for the next interval
            this.lastEmitTime = now
            this.peakMagnitudes.fill(0)
          }
        }
      } catch (err) {
        logger.error("Error in FFT Service", err)
      }
    })

    this.pwProcess.on("error", (err) => logger.error("[FFTStreamService] Spawn Error:", err))
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[FFTStreamService] Stopping PipeWire (No active clients)")
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
