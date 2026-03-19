import type { MediaItem, PlaybackBackend } from "@/types";
import { spawn } from "node:child_process";

export class RadioPlaybackBackend implements PlaybackBackend {
  readonly id = "radio";

  private ffmpeg?: any;
  private pwcat?: any;
  private startedAt: number | null = null;
  private currentItem: MediaItem | null = null;

  async play(item: MediaItem): Promise<void> {
    await this.stop();

    this.currentItem = item;
    const url = item.sourceRef.uri ?? item.uri;
    if (!url) throw new Error("Radio backend: no stream URL");

    this.ffmpeg = spawn("ffmpeg", [
      "-i",
      url,
      "-vn",
      "-f",
      "s16le",
      "-ac",
      "2",
      "-ar",
      "48000",
      "pipe:1",
    ]);

    this.pwcat = spawn("pw-cat", ["-p", "48000", "-c", "2", "-f", "S16_LE", "-"]);

    this.ffmpeg.stdout.pipe(this.pwcat.stdin);

    this.startedAt = Date.now();
  }

  async pause(): Promise<void> {
    // Radio streams cannot be paused — stop instead
    await this.stop();
  }

  async stop(): Promise<void> {
    if (this.ffmpeg) this.ffmpeg.kill("SIGTERM");
    if (this.pwcat) this.pwcat.kill("SIGTERM");
    this.ffmpeg = undefined;
    this.pwcat = undefined;
    this.startedAt = null;
  }

  async seek(): Promise<void> {
    // Radio streams cannot seek
    return;
  }

  async getPosition(): Promise<number> {
    if (!this.startedAt) return 0;
    return Date.now() - this.startedAt;
  }
}
