import { ChildProcessWithoutNullStreams,spawn } from "child_process"
import FFT from "fft.js"

import { logger } from "@/logger"

export class AudioService {
  private static instance: AudioService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  private listeners: Set<(data: Float32Array) => void> = new Set()

  // Initialize FFT for 1024 points
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
    logger.info("[AudioService] 🔊 Starting PipeWire capture...")

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
        // Prepare input for fft.js (it expects a standard array or Float32Array)
        const input = new Float32Array(1024)
        for (let i = 0; i < 1024; i++) {
          input[i] = samples[i] / 32768.0
        }

        // fft.js output is interleaved: [real0, imag0, real1, imag1, ...]
        const out = this.fft.createComplexArray()
        this.fft.realTransform(out, input)

        // Calculate magnitudes for 64 frequency bins
        const magnitudes = new Float32Array(64)
        for (let i = 0; i < 64; i++) {
          const real = out[i * 2]
          const imag = out[i * 2 + 1]
          magnitudes[i] = Math.sqrt(real * real + imag * imag)
        }

        const now = Date.now()
        if (now - this.lastLogTime > 5000) {
          logger.info(
            `[AudioService] ⚡ FFT Active: Broadcasting to ${this.listeners.size} clients.`,
          )
          this.lastLogTime = now
        }

        this.listeners.forEach((cb) => cb(magnitudes))
      }
    })

    this.pwProcess.on("error", (err) => logger.error("[AudioService] Spawn Error:", err))
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[AudioService] 🔇 Stopping PipeWire (No active clients)")
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
