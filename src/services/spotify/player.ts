import { AxiosInstance } from "axios"

import { getLogger } from "../../logger"
import { stripSpotifyFields } from "../../utils/spotifyFieldStripper"

export class PlayerApi {
  constructor(
    private librespot: AxiosInstance,
    private spotify: AxiosInstance,
  ) {}

  // --- Health ---
  async ping() {
    const res = await this.librespot.get("/")
    return res.data
  }

  // --- Playback state ---
  async getStatus() {
    const log = getLogger()
    const res = await this.librespot.get("/status")
    log.info(`librespot state ${JSON.stringify(res.data)}`)
    return res.data
  }

  // --- Playback control ---
  async play(uri?: string, skipToUri?: string, paused = false) {
    const payload: Record<string, any> = {}

    if (uri) payload.uri = uri
    if (skipToUri) payload.skip_to_uri = skipToUri
    if (paused) payload.paused = paused

    const res = await this.librespot.post("/player/play", payload)
    return res.data
  }

  async pause() {
    const res = await this.librespot.post("/player/pause", {})
    return res.data
  }

  async resume() {
    const res = await this.librespot.post("/player/resume", {})
    return res.data
  }

  async playPause() {
    const res = await this.librespot.post("/player/playpause", {})
    return res.data
  }

  async next(uri?: string) {
    const payload = uri ? { uri } : {}
    const res = await this.librespot.post("/player/next", payload)
    return res.data
  }

  async previous() {
    const res = await this.librespot.post("/player/prev", {})
    return res.data
  }

  async seek(positionMs: number, relative = false) {
    const res = await this.librespot.post("/player/seek", {
      position: positionMs,
      relative,
    })
    return res.data
  }

  // --- Volume ---
  async getVolume() {
    const res = await this.librespot.get("/player/volume")
    return res.data
  }

  async setVolume(volume: number, relative = false) {
    const res = await this.librespot.post("/player/volume", {
      volume,
      relative,
    })
    return res.data
  }

  // --- Repeat / Shuffle ---
  async setRepeatContext(enabled: boolean) {
    const res = await this.librespot.post("/player/repeat_context", {
      repeat_context: enabled,
    })
    return res.data
  }

  async setRepeatTrack(enabled: boolean) {
    const res = await this.librespot.post("/player/repeat_track", {
      repeat_track: enabled,
    })
    return res.data
  }

  async setShuffleContext(enabled: boolean) {
    const res = await this.librespot.post("/player/shuffle_context", {
      shuffle_context: enabled,
    })
    return res.data
  }

  // --- Queue ---
  async addToQueue(uri: string) {
    const res = await this.librespot.post("/player/add_to_queue", { uri })
    return res.data
  }

  // --- Playback state ---
  async getPlaybackState() {
    const res = await this.librespot.get("/status")
    // spotify.get("/me/player")
    return res.data
  }

  async getDevices() {
    const res = await this.spotify.get("/me/player/devices")
    return stripSpotifyFields(res.data.devices)
  }

  async transferPlayback(deviceId: string, play = true) {
    const res = await this.spotify.put("/me/player", {
      device_ids: [deviceId],
      play,
    })
    return stripSpotifyFields(res.data)
  }

  async getQueue() {
    const res = await this.spotify.get("/me/player/queue")
    return stripSpotifyFields(res.data)
  }

  // --- History ---
  async getRecentlyPlayed(opts: { limit?: number; before?: number; after?: number } = {}) {
    const res = await this.spotify.get("/me/player/recently-played", {
      params: opts,
    })
    return stripSpotifyFields(res.data)
  }

  // --- Lookup ---
  async getAlbum(albumId: string) {
    const res = await this.spotify.get(`/albums/${albumId}`)
    return stripSpotifyFields(res.data)
  }

  async getArtist(artistId: string) {
    const res = await this.spotify.get(`/artists/${artistId}`)
    return stripSpotifyFields(res.data)
  }
}
