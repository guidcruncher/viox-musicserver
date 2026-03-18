// src/services/mpd/mpdClient.ts
import mpd from "mpd"

import { getLogger } from "../../logger"
const { cmd } = mpd

let albumArtUrl: string | null

type Inferred = number | boolean | string | Date

class MpdClient {
  private client: any

  constructor() {
    albumArtUrl = null
    this.client = mpd.connect({
      host: "localhost",
      port: 6600,
    })

    this.client.on("error", (err: any) => {
      console.error("MPD error:", err)
    })
  }

  //
  // --- Helpers ---
  //
  private inferValue(key: string, value: string): Inferred {
    const trimmed = value.trim()

    if (["pos", "playlistlength", "songid", "mixrampdb", "volume", "id"].includes(key)) {
      const test = Number(trimmed)
      if (!isNaN(test) && trimmed !== "") return test
    }

    // 1. Boolean (MPD uses 0/1 for flags)
    if (trimmed === "0") return false
    if (trimmed === "1") return true

    // 2. Number (integer or float)
    const num = Number(trimmed)
    if (!isNaN(num) && trimmed !== "") return num

    // 3. Date (ISO, RFC2822, or timestamp)
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) return date

    // 4. Fallback: string
    return trimmed
  }

  private parseResult<T extends Record<string, Inferred>>(raw: string): T {
    const result: Record<string, Inferred> = {}

    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const idx = line.indexOf(":")
        if (idx === -1) return

        const key = line.slice(0, idx).trim().toLowerCase()
        const value = line.slice(idx + 1).trim()

        result[key] = this.inferValue(key, value)
      })

    return result as T
  }

  private send(command: string, args: string[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      const log = getLogger()
      log.trace(`MPD Command ${command} ${args.join(" ")}`)
      this.client.sendCommand(cmd(command, args), (err: any, msg: any) => {
        if (err) return reject(err)
        resolve(msg)
      })
    })
  }

  //
  // --- Core playback ---
  //

  async play() {
    return await this.send("play")
  }

  async playUri(uri: string, imageUrl?: string) {
    albumArtUrl = null
    if (imageUrl) albumArtUrl = imageUrl
    await this.send("clear")
    await this.send("add", [uri])
    return await this.send("play")
  }

  async pause() {
    return await this.send("pause", ["1"])
  }

  async resume() {
    return await this.send("pause", ["0"])
  }

  async stop() {
    await this.send("stop")
    return await this.clear()
  }

  async next() {
    return await this.send("next")
  }

  async previous() {
    return await this.send("previous")
  }

  async seek(positionMs: number) {
    const seconds = Math.floor(positionMs / 1000)
    return await this.send("seekcur", [String(seconds)])
  }

  async setVolume(percent: number) {
    return await this.send("setvol", [String(percent)])
  }

  //
  // --- Queue ---
  //

  async add(uri: string) {
    return await this.send("add", [uri])
  }

  async clear() {
    albumArtUrl = null
    return await this.send("clear")
  }

  async addToQueue(uri: string) {
    return await this.add(uri)
  }

  async playNext(uri: string) {
    return await this.send("addid", [uri, "1"])
  }

  async list() {
    return await this.send("playlistinfo")
  }

  //
  // --- History (simulated) ---
  //

  async history() {
    return await this.send("stats")
  }

  //
  // --- Now Playing ---
  //

  async currentSong(): Promise<any> {
    const res = await this.send("currentsong")
    let current: any = {}
    if (res) current = this.parseResult(res)
    current.imageUrl = albumArtUrl
    return current
  }

  async nowPlaying() {
    return await this.currentSong()
  }

  //
  // --- Status ---
  //

  async status(): Promise<any> {
    const raw = await this.send("status")
    const status: any = this.parseResult(raw)
    status.track = await this.currentSong()
    return status
  }

  //
  // --- Search ---
  //

  async searchFile(uri: string) {
    return await this.send("search", ["file", uri])
  }
}

export const mpdClient = new MpdClient()
