import { AxiosInstance } from "axios";

export class PlayerApi {
  constructor(
    private librespot: AxiosInstance,
    private spotify: AxiosInstance
  ) {}

  async play(uri?: string, skipToUri?: string, paused = false) {
    const payload: Record<string, any> = {};
    if (uri) payload.uri = uri;
    if (skipToUri) payload.skip_to_uri = skipToUri;
    if (paused) payload.paused = paused;

    return (await this.librespot.post("/player/play", payload)).data;
  }

  async pause() {
    return (await this.librespot.post("/player/pause", {})).data;
  }

  async resume() {
    return (await this.librespot.post("/player/resume", {})).data;
  }

  async next() {
    return (await this.librespot.post("/player/next", {})).data;
  }

  async previous() {
    return (await this.librespot.post("/player/prev", {})).data;
  }

  async seek(positionMs: number) {
    return (
      await this.librespot.post("/player/seek", {
        position: positionMs,
        relative: false,
      })
    ).data;
  }

  async getStatus() {
    return (await this.librespot.get("/status")).data;
  }

  async getDevices() {
    return (await this.spotify.get("/me/player/devices")).data.devices;
  }
}
