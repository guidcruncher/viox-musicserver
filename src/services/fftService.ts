import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { FFTW } from "node-fftw"

import { logger } from "@/logger"

export class AudioService {
  private static instance: AudioService
  private pwProcess: ChildProcessWithoutNullStreams | null = null
  private listeners: Set<(data: Float32Array) => void> = new Set()
  private fft = new FFTW(1024)

  // For throttled logging
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
    logger.info(`[AudioService] Listener added. Total listeners: ${this.listeners.size}`)

    if (this.listeners.size === 1) {
      this.startPipeWire()
    }
  }

  public removeListener(callback: (data: Float32Array) => void): void {
    this.listeners.delete(callback)
    logger.info(`[AudioService] Listener removed. Total listeners: ${this.listeners.size}`)

    if (this.listeners.size === 0) {
      this.stopPipeWire()
    }
  }

  private startPipeWire(): void {
    logger.info("[AudioService] 🔊 Initializing PipeWire capture (pw-record)...")

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
        const realInput = new Float64Array(1024)
        const imagInput = new Float64Array(1024)

        for (let i = 0; i < 1024; i++) {
          realInput[i] = samples[i] / 32768.0
        }

        const { real, imag } = this.fft.forward(realInput, imagInput)
        const bins = 64
        const magnitudes = new Float32Array(bins)

        for (let i = 0; i < bins; i++) {
          magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i])
        }

        // Throttle "Data Flowing" log to once every 5 seconds
        const now = Date.now()
        if (now - this.lastLogTime > 5000) {
          logger.info(
            `[AudioService] ⚡ FFT Broadcast: Active with ${this.listeners.size} clients.`,
          )
          this.lastLogTime = now
        }

        this.listeners.forEach((cb) => cb(magnitudes))
      }
    })

    this.pwProcess.stderr.on("data", (data) => {
      logger.error(`[AudioService] PipeWire STDERR: ${data}`)
    })

    this.pwProcess.on("exit", (code) => {
      logger.info(`[AudioService] PipeWire process exited with code ${code}`)
    })
  }

  private stopPipeWire(): void {
    if (this.pwProcess) {
      logger.info("[AudioService] 🔇 Killing PipeWire process (No active listeners)...")
      this.pwProcess.kill("SIGTERM")
      this.pwProcess = null
    }
  }
}
