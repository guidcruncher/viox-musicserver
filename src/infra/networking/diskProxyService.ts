import fs, { promises as fsPromises } from "fs"
import http from "http"
import { URL } from "url"

import { getConfig } from "@/config"
import { logger } from "@/logger"

import { hashAudioFilename } from "./hashFilename"
import { ProxyResult, ProxyService } from "./types/proxyService"
import { getHttpClient } from "./utils"

export class DiskProxyService implements ProxyService {
  private readonly maxRedirects: number
  private readonly maxRetries: number
  private readonly tempDir: string
  private readonly timeout: number

  constructor(
    options: {
      maxRedirects?: number
      maxRetries?: number
      tempDir?: string
      timeout?: number
    } = {},
  ) {
    this.maxRedirects = options.maxRedirects ?? 5
    this.maxRetries = options.maxRetries ?? 3
    this.tempDir = getConfig("cacheFolder")
    this.timeout = options.timeout ?? 20000
  }

  async stream(remoteUrl: string): Promise<ProxyResult> {
    const finalPath = hashAudioFilename(remoteUrl)
    const partPath = `${finalPath}.part`

    const logContext = { url: remoteUrl }
    logger.info(`finalPath="${finalPath}" partPath="${partPath}"`)
    // --- STEP 1: Check for Cache Hit ---
    try {
      await fsPromises.access(finalPath, fs.constants.F_OK)
      logger.info("proxy.cache.hit", logContext)

      return {
        stream: fs.createReadStream(finalPath),
        contentType: "audio/mpeg", // In a real app, you might cache the content-type in a metadata file
        abort: () => {}, // No cleanup needed for a permanent cache hit
      }
    } catch {
      logger.debug("proxy.cache.miss", logContext)
    }

    let finalContentType = "audio/mpeg"
    let currentUrl = remoteUrl
    let attempts = 0

    const downloadToDisk = async (): Promise<void> => {
      while (attempts <= this.maxRetries) {
        let fileWriter: any = null

        try {
          const stats = await fsPromises.stat(partPath).catch(() => ({ size: 0 }))
          const startByte = stats.size

          await new Promise<void>((resolve, reject) => {
            const client = getHttpClient(currentUrl)
            const headers: http.OutgoingHttpHeaders =
              startByte > 0 ? { Range: `bytes=${startByte}-` } : {}

            const req = client.get(currentUrl, { headers, timeout: this.timeout }, (res) => {
              const status = res.statusCode ?? 0

              if (status >= 300 && status < 400 && res.headers.location) {
                currentUrl = new URL(res.headers.location, currentUrl).toString()
                res.resume()
                return resolve(downloadToDisk())
              }

              const isSuccess = startByte > 0 ? status === 206 : status === 200
              if (!isSuccess) {
                res.resume()
                const err = new Error(`Upstream returned ${status}`) as any
                err.fatal = status === 404 || status === 403
                return reject(err)
              }

              finalContentType = res.headers["content-type"] || finalContentType
              fileWriter = fs.createWriteStream(partPath, { flags: startByte > 0 ? "a" : "w" })

              res.pipe(fileWriter)
              res.on("error", (err) => {
                fileWriter?.destroy()
                reject(err)
              })

              fileWriter.on("finish", () => {
                fileWriter?.close()
                resolve()
              })

              fileWriter.on("error", reject)
            })

            req.on("timeout", () => {
              req.destroy()
              reject(new Error("ETIMEDOUT"))
            })

            req.on("error", reject)
          })

          // Move .part to final destination upon completion
          await fsPromises.rename(partPath, finalPath)
          logger.info("proxy.download.finalized", logContext)
          return
        } catch (err: any) {
          attempts++
          fileWriter?.destroy()

          if (attempts > this.maxRetries || err.fatal) {
            throw err
          }

          const backoff = Math.pow(2, attempts) * 1000
          logger.warn("proxy.download.retry", { ...logContext, attempt: attempts, backoff })
          await new Promise((r) => setTimeout(r, backoff))
        }
      }
    }

    try {
      await downloadToDisk()

      const readStream = fs.createReadStream(finalPath)

      // NOTE: Since this is a CACHE, we likely don't want to unlink the file
      // in the cleanup/close event anymore. If you want it to be a temporary
      // cache, you'd implement a separate TTL (Time To Live) cleanup task.

      return {
        stream: readStream,
        contentType: finalContentType,
        abort: () => readStream.destroy(),
      }
    } catch (err) {
      if (fs.existsSync(partPath)) {
        await fsPromises.unlink(partPath).catch(() => {})
      }
      throw err
    }
  }
}
