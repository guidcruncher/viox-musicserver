import { setTimeout as delay } from "node:timers/promises"

import fs from "fs"

import { logger } from "@/logger"

import { hashAudioFilename } from "./hashFilename"

export interface DownloadOptions {
  retries?: number
  backoffMs?: number
  chunkSize?: number
}

export interface FileDownloader {
  downloadFile(url: string, opts: DownloadOptions): Promise<void>
}

export class NullDownload implements FileDownloader {
  async downloadFile(url: string, _opts: DownloadOptions = {}): Promise<void> {
    logger.trace(`Null downloader invoked ${url}`)
  }
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof TypeError) return true // fetch network failures
  if (err instanceof Error) {
    const msg = err.message
    if (msg.startsWith("HTTP 5")) return true // server errors
    if (msg === "No response body") return true
    if (
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("EAI_AGAIN") ||
      msg.includes("fetch failed")
    ) {
      return true
    }
  }
  return false
}

export class FileDownload implements FileDownloader {
  async downloadFile(url: string, opts: DownloadOptions = {}): Promise<void> {
    const destination = hashAudioFilename(url)
    const partPath = `${destination}.part`

    const maxRetries = opts.retries ?? 5
    const backoffMs = opts.backoffMs ?? 500

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      let fileStream: fs.WriteStream | undefined
      try {
        const existingSize = fs.existsSync(partPath) ? fs.statSync(partPath).size : 0

        const headers: Record<string, string> = {}
        if (existingSize > 0) {
          headers["Range"] = `bytes=${existingSize}-`
        }

        const res = await fetch(url, { headers })

        if (!res.ok && res.status !== 206) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`)
        }

        fileStream = fs.createWriteStream(partPath, {
          flags: existingSize > 0 ? "a" : "w",
        })

        if (!res.body) throw new Error("No response body")

        for await (const chunk of res.body as any) {
          fileStream.write(chunk)
        }

        await new Promise<void>((resolve, reject) => {
          fileStream!.on("finish", resolve)
          fileStream!.on("error", reject)
          fileStream!.end()
        })

        fs.renameSync(partPath, destination)
        logger.info(`Download complete for ${url} on attempt ${attempt}`)
        return
      } catch (err) {
        fileStream?.destroy()

        if (!isRetryableError(err)) {
          logger.error(
            `Non-retryable error downloading ${url} on attempt ${attempt}, aborting`,
            err,
          )
          if (fs.existsSync(partPath)) {
            fs.unlinkSync(partPath)
          }
          throw err
        }

        const remaining = maxRetries + 1 - attempt
        if (remaining <= 0) {
          logger.error(
            `Download of ${url} failed after ${maxRetries + 1} attempts, no retries remaining`,
            err,
          )
          if (fs.existsSync(partPath)) {
            fs.unlinkSync(partPath)
          }
          throw err
        }

        const delayMs = backoffMs * attempt
        logger.warn(
          `Retryable error downloading ${url} on attempt ${attempt}/${maxRetries + 1}` +
            ` — retrying in ${delayMs}ms (${remaining} retries remaining)`,
          err,
        )
        await delay(delayMs)
      }
    }
  }
}
