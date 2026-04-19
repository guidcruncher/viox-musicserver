import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { PassThrough, Readable } from "stream";
import { logger } from "@/logger";

export class AudioStreamService {
  private static instance: AudioStreamService;
  private encoderProcess: ChildProcessWithoutNullStreams | null = null;
  
  // HighWaterMark set to 32KB to handle compressed Opus chunks comfortably
  private centralStream: PassThrough = new PassThrough({ highWaterMark: 32768 });
  private consumerCount = 0;

  private constructor() {
    this.centralStream.on("error", (err) => 
      logger.error("[AudioStreamService] Central Stream Error:", err)
    );
  }

  public static getInstance(): AudioStreamService {
    if (!AudioStreamService.instance) {
      AudioStreamService.instance = new AudioStreamService();
    }
    return AudioStreamService.instance;
  }

  public getAudioStream(): Readable {
    this.consumerCount++;
    logger.info(`[AudioStreamService] Client connected. Total: ${this.consumerCount}`);

    if (this.consumerCount === 1) {
      this.startStreaming();
    }

    const consumerStream = new PassThrough({ highWaterMark: 32768 });
    this.centralStream.pipe(consumerStream);

    consumerStream.on("close", () => {
      this.centralStream.unpipe(consumerStream);
      this.consumerCount--;
      logger.info(`[AudioStreamService] Client disconnected. Total: ${this.consumerCount}`);
      
      if (this.consumerCount === 0) {
        this.stopStreaming();
      }
    });

    return consumerStream;
  }

  private startStreaming(): void {
    logger.info("[AudioStreamService] Initializing Direct FFmpeg-Pulse Capture...");

    /**
     * FFmpeg Direct Capture & Encode
     * -f pulse: Use PulseAudio/PipeWire input
     * -i ...monitor: Captures the 'output' of the sink
     * -application lowdelay: Optimizes Opus for real-time
     */
    this.encoderProcess = spawn("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-f", "pulse",
      "-i", "snapcast-sink.monitor", 
      "-c:a", "libopus",
      "-b:a", "128k",
      "-vbr", "on",
      "-compression_level", "10",
      "-frame_duration", "20",
      "-application", "lowdelay",
      "-f", "opus",
      "pipe:1"
    ]);

    this.encoderProcess.stdout.on("data", (chunk: Buffer) => {
      const canAccept = this.centralStream.write(chunk);
      
      if (!canAccept) {
        // Backpressure: Drop the oldest buffered data to maintain real-time sync
        this.centralStream.read();
      }
    });

    this.encoderProcess.stderr.on("data", (data) => {
      logger.debug(`[AudioStreamService] FFmpeg: ${data}`);
    });

    this.encoderProcess.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        logger.error(`[AudioStreamService] FFmpeg exited with code ${code}`);
      }
    });
  }

  private stopStreaming(): void {
    if (this.encoderProcess) {
      logger.info("[AudioStreamService] Stopping encoder (No active clients)");
      this.encoderProcess.kill("SIGTERM");
      this.encoderProcess = null;
    }
  }
}
