import fs, { promises as fsPromises } from "fs"
import http from "http"
import { URL } from "url"

import { hashAudioFilename } from "./hashFilename"
import { logger } from "@/logger"

import { setTimeout as delay } from "node:timers/promises"

export interface DownloadOptions {
  retries?: number
  backoffMs?: number
  chunkSize?: number
}

export async function downloadFile(url: string, opts: DownloadOptions = {}): Promise<void> {
  const destination = hashAudioFilename(url)

  if (fs.existsSync(destination)) {
    logger.info(`URL ${url} already downloaded to ${destination}`)
    return
  }

  const retries = opts.retries ?? 5
  const backoffMs = opts.backoffMs ?? 500

  let attempt = 0

  while (true) {
    try {
      const existingSize = fs.existsSync(destination) ? fs.statSync(destination).size : 0

      const headers: Record<string, string> = {}
      if (existingSize > 0) {
        headers["Range"] = `bytes=${existingSize}-`
      }

      const res = await fetch(url, { headers })

      if (!res.ok && res.status !== 206) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      }

      const fileStream = fs.createWriteStream(destination, {
        flags: existingSize > 0 ? "a" : "w",
      })

      if (!res.body) throw new Error("No response body")

      for await (const chunk of res.body as any) {
        fileStream.write(chunk)
      }

      fileStream.end()
      return
    } catch (err) {
      logger.error(`Error during download of ${url} on attempt ${attempt}`, err)
      attempt++
      if (attempt > retries) throw err
      await delay(backoffMs * attempt)
    }
  }
}
