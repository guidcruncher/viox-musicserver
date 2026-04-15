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
  private retryDelay = 1000 // Start with 1s

  private constructor(private socketPath: string) {
    super()
  }

  public static getInstance(socketPath: string = "/tmp/mpv-ipc/socket"): MpvClient {
    if (!MpvClient.instance) {
      MpvClient.instance = new MpvClient(socketPath)
    }
    return MpvClient.instance
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
   * Logs messages with a consistent format
   */
  private log(level: "info" | "warn" | "error", message: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    logger[level](`[${timestamp}] [MpvClient] [${level.toUpperCase()}] ${message}`, ...args)
  }

  /**
   * Establishes connection with guard clauses and cleanup
   */
  public async connect(): Promise<void> {
    if (this.isConnected) return
    if (this.isConnecting) {
      return new Promise((resolve) => this.once("connected", resolve))
    }

    this.isConnecting = true
    this.log("info", `Attempting connection to ${this.socketPath}`)

    // Critical: Ensure old socket is destroyed before creating a new one to prevent EISCONN
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

      this.socket!.connect(this.socketPath, () => {
        clearTimeout(connectionTimeout)
        this.isConnected = true
        this.isConnecting = false
        this.retryDelay = 1000 // Reset backoff on success
        this.log("info", "Successfully connected to MPV")
        this.setupListeners()
        this.emit("connected")
        resolve()
      })

      this.socket!.once("error", (err) => {
        clearTimeout(connectionTimeout)
        this.isConnecting = false
        this.log("error", `Socket connection failed: ${err.message}`)
        this.handleReconnect()
        reject(err)
      })
    })
  }

  private setupListeners(): void {
    if (!this.socket) return

    this.socket.on("data", (chunk: string) => this.handleData(chunk))

    this.socket.on("error", (err) => {
      this.log("error", `Runtime socket error: ${err.message}`)
    })

    this.socket.on("close", (hadError) => {
      this.log("warn", `Connection closed ${hadError ? "due to error" : "by MPV"}`)
      this.cleanup()
      this.handleReconnect()
    })
  }

  private handleReconnect() {
    if (this.reconnectTimeout) return

    this.log("info", `Retrying connection in ${this.retryDelay}ms...`)
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null
      // Exponential backoff up to 30 seconds
      this.retryDelay = Math.min(this.retryDelay * 2, 30000)
      try {
        await this.connect()
      } catch {
        // Error already logged in connect()
      }
    }, this.retryDelay)
  }

  private cleanup(reason: string = "Connection lost") {
    this.isConnected = false
    this.isConnecting = false
    this.buffer = ""

    // Reject all pending promises so the app doesn't hang
    for (const [id, req] of this.pendingRequests) {
      clearTimeout(req.timer)
      req.reject(new Error(`${reason} for request ${id}`))
    }
    this.pendingRequests.clear()

    if (this.socket) {
      this.socket.destroy()
      this.socket.removeAllListeners()
      this.socket = null
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

        if (msg.request_id && this.pendingRequests.has(msg.request_id)) {
          const req = this.pendingRequests.get(msg.request_id)
          if (req) {
            clearTimeout(req.timer)
            if (msg.error === "success") req.resolve(msg.data)
            else req.reject(new Error(msg.error))
          }
          this.pendingRequests.delete(msg.request_id)
        }

        if (msg.event) {
          this.emit(msg.event, msg)
        }
      } catch (e) {
        this.log("error", `Failed to parse MPV message: ${trimmed}`, e)
      }
    }
  }

  /**
   * Sends a command with a 3-second timeout guard
   */
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
        this.socket.write(payload, (err) => {
          if (err) {
            clearTimeout(timer)
            this.pendingRequests.delete(id)
            reject(err)
          }
        })
      } else {
        clearTimeout(timer)
        this.pendingRequests.delete(id)
        reject(new Error("Socket not available"))
      }
    })
  }

  // --- Convenience Methods ---
  async play(path: string) {
    return this.send(["loadfile", path])
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
  async stop() {
    return this.send(["stop"])
  }
  async seek(seconds: number) {
    return this.send(["seek", seconds, "relative"])
  }
  async observe(propertyName: string) {
    return this.send(["observe_property", 1, propertyName])
  }
}
