import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import FFT from "fft.js"

import { logger } from "@/logger"

export class AudioService {
  private static instance: AudioService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  private listeners: Set<(data: Float32Array) => void> = new Set()
  private fft = new FFT(1024)
  private lastLogTime = 0

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  public addListener(callback: (data: Float32Array) => void): void {
    this.listeners.add(callback)
    logger.info(`[AudioService] Client connected. Total: ${this.listeners.size}`)
    if (this.listeners.size === 1) this.startPipeWire()
  }

  public removeListener(callback: (data: Float32Array) => void): void {
    this.listeners.delete(callback)
    logger.info(`[AudioService] Client disconnected. Total: ${this.listeners.size}`)
    if (this.listeners.size === 0) this.stopPipeWire()
  }

  private startPipeWire(): void {
    logger.info("[AudioService] Starting PipeWire capture...")

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

        if (samples.length >= 1024) {
          const input = new Float32Array(1024)
          for (let i = 0; i < 1024; i++) {
            input[i] = samples[i] / 32768.0
          }

          const out = this.fft.createComplexArray()
          this.fft.realTransform(out, input)

          const magnitudes = new Float32Array(64)

          /**
           * NOISE GATE: Subtracts system floor noise.
           * Increase this if bars still jitter during silence.
           */
          const NOISE_THRESHOLD = 0.012

          for (let i = 0; i < 64; i++) {
            const real = out[i * 2]
            const imag = out[i * 2 + 1]
            let mag = Math.sqrt(real * real + imag * imag)

            if (mag < NOISE_THRESHOLD) {
              magnitudes[i] = 0
            } else {
              // Smoothly start the signal from zero above the noise floor
              magnitudes[i] = (mag - NOISE_THRESHOLD) * 1.5
            }
          }

          this.listeners.forEach((cb) => cb(magnitudes))
        }
      } catch (err) {
        logger.error("Error in FFT Service", err)
      }
    })

    this.pwProcess.on("error", (err) => logger.error("[AudioService] Spawn Error:", err))
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[AudioService] Stopping PipeWire (No active clients)")
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
