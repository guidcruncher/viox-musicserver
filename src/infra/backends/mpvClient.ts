import { exec } from "child_process"
import { EventEmitter } from "events"
import * as net from "net"

import { logger } from "@/logger"

interface MpvResponse {
  error: string
  data?: any
  request_id?: number
  event?: string
  name?: string
  id?: number // Used by property-change events
}

export class MpvClient extends EventEmitter {
  private static instance: MpvClient
  private socket: net.Socket | null = null
  private requestId = 1
  private pendingRequests = new Map<
    number,
    { resolve: (res: any) => void; reject: (err: any) => void; timer: NodeJS.Timeout }
  >()
  private buffer = ""
  private isConnected = false
  private isConnecting = false
  private reconnectTimeout: NodeJS.Timeout | null = null
  private retryDelay = 1000

  // Trackers for progress calculation
  private _currentTime = 0
  private _duration = 0

  private constructor(private socketPath: string) {
    super()
  }

  public static getInstance(socketPath: string = "/tmp/mpv-ipc/socket"): MpvClient {
    if (!MpvClient.instance) {
      MpvClient.instance = new MpvClient(socketPath)
    }
    return MpvClient.instance
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return
    if (this.isConnecting) {
      return new Promise((resolve) => this.once("connected", resolve))
    }

    this.isConnecting = true

    if (this.socket) {
      this.socket.destroy()
      this.socket.removeAllListeners()
    }

    this.socket = new net.Socket()
    this.socket.setEncoding("utf8")

    return new Promise((resolve, reject) => {
      const connectionTimeout = setTimeout(() => {
        this.cleanup("Connection timeout")
        reject(new Error("MPV connection timeout"))
      }, 5000)

      this.socket!.connect(this.socketPath, async () => {
        clearTimeout(connectionTimeout)
        this.isConnected = true
        this.isConnecting = false
        this.retryDelay = 1000
        this.setupListeners()

        // CRITICAL: Re-subscribe to observations on every new connection
        await this.setupProgressObservations()

        this.emit("connected")
        resolve()
      })

      this.socket!.once("error", (err) => {
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        this.handleReconnect()
        reject(err)
      })
    })
  }

  public static async restart(): Promise<void> {
    try {
      await new Promise((resolve) => exec(`/usr/local/bin/mpv.sh`, resolve))
    } catch (e) {
      logger.warn("[MpvClient] start failed", e)
    }

    return this.getInstance().connect()
  }

  /**
   * Tells MPV to push updates whenever these values change
   */
  private async setupProgressObservations(): Promise<void> {
    try {
      // Use fixed IDs for these properties so we can identify them in handleData
      await this.send(["observe_property", 10, "time-pos"])
      await this.send(["observe_property", 11, "duration"])
      await this.send(["observe_property", 12, "pause"])
    } catch (e) {
      logger.error("[MpvClient] Failed to setup observations", e)
    }
  }

  private handleData(chunk: string): void {
    this.buffer += chunk
    const lines = this.buffer.split("\n")
    this.buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      try {
        const msg: MpvResponse = JSON.parse(trimmed)

        // Handle Request/Response Cycle
        if (msg.request_id && this.pendingRequests.has(msg.request_id)) {
          const req = this.pendingRequests.get(msg.request_id)
          if (req) {
            clearTimeout(req.timer)
            if (msg.error === "success") req.resolve(msg.data)
            else req.reject(new Error(msg.error))
          }
          this.pendingRequests.delete(msg.request_id)
        }

        // Handle Property Changes (Progress Tracking)
        if (msg.event === "property-change") {
          this.processPropertyChange(msg)
        }

        // Emit generic events (end-file, pause, etc)
        if (msg.event) {
          this.emit(msg.event, msg)
        }
      } catch (e) {
        logger.error(`[MpvClient] Parse error: ${trimmed}`, e)
      }
    }
  }

  private processPropertyChange(msg: MpvResponse) {
    if (msg.id === 10) {
      // time-pos
      this._currentTime = msg.data ?? 0
    } else if (msg.id === 11) {
      // duration
      this._duration = msg.data ?? 0
    }

    const percent = this._duration > 0 ? (this._currentTime / this._duration) * 100 : 0

    this.emit("time-update", {
      current: this._currentTime,
      total: this._duration,
      percent: percent,
    })
  }

  public async send(command: (string | number | boolean)[]): Promise<any> {
    if (!this.isConnected) {
      await this.connect()
    }

    const id = this.requestId++
    const payload = JSON.stringify({ command, request_id: id }) + "\n"

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`MPV request ${id} timed out`))
        }
      }, 3000)

      this.pendingRequests.set(id, { resolve, reject, timer })

      if (this.socket && this.isConnected) {
        this.socket.write(payload)
      } else {
        clearTimeout(timer)
        this.pendingRequests.delete(id)
        reject(new Error("Socket not available"))
      }
    })
  }

  private setupListeners(): void {
    if (!this.socket) return
    this.socket.on("data", (chunk: string) => this.handleData(chunk))
    this.socket.on("close", () => {
      this.cleanup()
      this.handleReconnect()
    })
  }

  private handleReconnect() {
    if (this.reconnectTimeout) return
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null
      this.retryDelay = Math.min(this.retryDelay * 2, 30000)
      try {
        await this.connect()
      } catch {
        logger.warn("Reconnecting")
      }
    }, this.retryDelay)
  }

  public static async warmup(retries = 5, delayMs = 1000): Promise<void> {
    const instance = this.getInstance()
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await instance.connect()
        logger.info(`[MpvClient] warmup connected on attempt ${attempt}`)
        return
      } catch {
        logger.warn(`[MpvClient] warmup attempt ${attempt}/${retries} failed`)
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }
    logger.error("[MpvClient] warmup exhausted all retries — first playback may fail")
  }

  private cleanup(reason: string = "Connection lost") {
    this.isConnected = false
    this.isConnecting = false
    for (const [id, req] of this.pendingRequests) {
      clearTimeout(req.timer)
      req.reject(new Error(`${reason} for request ${id}`))
    }
    this.pendingRequests.clear()
    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }
  }

  // Convenience methods
  async play(path: string) {
    return this.send(["loadfile", path])
  }
  async stop() {
    this._currentTime = 0
    return this.send(["stop"])
  }

  async togglePause() {
    return this.send(["cycle", "pause"])
  }
  async pause() {
    return this.send(["set_property", "pause", true])
  }
  async resume() {
    return this.send(["set_property", "pause", false])
  }
}
