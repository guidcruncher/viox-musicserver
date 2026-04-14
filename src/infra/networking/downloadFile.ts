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

export class FileDownload implements FileDownloader {
  async downloadFile(url: string, opts: DownloadOptions = {}): Promise<void> {
    const destination = hashAudioFilename(url)
    const partPath = `${destination}.part`

    if (fs.existsSync(destination)) {
      logger.info(`URL ${url} already downloaded to ${destination}`)
      return
    }

    const retries = opts.retries ?? 5
    const backoffMs = opts.backoffMs ?? 500

    let attempt = 0

    while (true) {
      let fileStream: fs.WriteStream | null = null
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
        return
      } catch (err) {
        fileStream?.destroy()
        logger.error(`Error during download of ${url} on attempt ${attempt}`, err)
        attempt++
        if (attempt > retries) {
          if (fs.existsSync(partPath)) {
            fs.unlinkSync(partPath)
          }
          throw err
        }
        await delay(backoffMs * attempt)
      }
    }
  }
}
