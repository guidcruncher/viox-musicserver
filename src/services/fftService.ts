import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import { fft, util as fftUtil } from "fft-js"

export class AudioService {
  private pwProcess: ChildProcessWithoutNullStreams | null = null

  /**
   * Starts capturing audio and executes a callback with the FFT result
   */
  public streamFFT(onData: (data: Float32Array) => void): void {
    this.pwProcess = spawn("pw-record", [
      "--target",
      "default",
      "--format",
      "s16",
      "--rate",
      "48000",
      "--channels",
      "1",
      "-",
    ])

    this.pwProcess.stdout.on("data", (chunk: Buffer) => {
      const samples = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2)

      // FFT requires power-of-two (1024 is a good balance for 44.1kHz)
      if (samples.length >= 1024) {
        const signal = Array.from(samples.slice(0, 1024)).map((n) => n / 32768.0)

        try {
          const phasors = fft(signal)
          const magnitudes = fftUtil.fftMag(phasors)

          // Slice first 64 bins (bass to mid-highs) for the visualizer
          onData(new Float32Array(magnitudes.slice(0, 64)))
        } catch (err) {
          // FFT-js can throw if signal length isn't a power of 2
          console.error("FFT Error:", err)
        }
      }
    })

    this.pwProcess.on("error", (err) => console.error("PipeWire Process Error:", err))
  }

  public stop(): void {
    if (this.pwProcess) {
      this.pwProcess.kill()
      this.pwProcess = null
    }
  }
}
