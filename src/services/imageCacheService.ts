import axios from "axios"
import { createReadStream, createWriteStream, existsSync, statSync } from "fs"
import { mkdir } from "fs/promises"
import path from "path"

import { config } from "@/config"
import { hashImageFilename } from "@/infra/networking/hashFilename"

export class ImageCacheService {
  private cacheDir: string

  constructor() {
    this.cacheDir = config.cacheFolder
  }

  private async ensureCacheDir() {
    await mkdir(this.cacheDir, { recursive: true })
  }

  private extractOriginalFilename(url: string): string {
    try {
      const pathname = new URL(url).pathname
      const base = path.basename(pathname)
      return base || "image"
    } catch {
      return "image"
    }
  }

  async getImage(url: string): Promise<{
    stream: NodeJS.ReadableStream
    mimeType: string
    originalFilename: string
  }> {
    await this.ensureCacheDir()

    const filePath = hashImageFilename(url)
    const originalFilename = this.extractOriginalFilename(url)

    // Serve from cache if exists
    if (existsSync(filePath) && statSync(filePath).size > 0) {
      const stream = createReadStream(filePath)
      const mimeType = this.detectMimeTypeFromFilename(originalFilename)
      return { stream, mimeType, originalFilename }
    }

    // Fetch from remote
    const response = await axios.get(url, {
      responseType: "stream",
      validateStatus: () => true,
    })

    if (response.status >= 400) {
      throw new Error(`Failed to fetch image: HTTP ${response.status}`)
    }

    const mimeType = String(response.headers["content-type"] ?? "application/octet-stream")

    // Cache to disk
    const writer = createWriteStream(filePath)
    response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve)
      writer.on("error", reject)
    })

    const stream = createReadStream(filePath)
    return { stream, mimeType, originalFilename }
  }

  private detectMimeTypeFromFilename(filename: string): string {
    const ext = path.extname(filename).toLowerCase()

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg"
      case ".png":
        return "image/png"
      case ".gif":
        return "image/gif"
      case ".webp":
        return "image/webp"
      case ".bmp":
        return "image/bmp"
      case ".svg":
        return "image/svg+xml"
      default:
        return "application/octet-stream"
    }
  }
}
