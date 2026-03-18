import fs from "fs"
import path from "path"
import { YtDlp } from "ytdlp-nodejs"

import { getConfig } from "@/config"

import { getLogger } from "../../logger"

const parseId = (id: string) => {
  const args = id.split(":")
  return args.length === 3 ? args[2] : id
}

export const youtubeProxyUrl = (id: string) => {
  return `http://127.0.0.1:8080/api/proxy/youtube?id=${encodeURIComponent(parseId(id))}`
}

export const downloadYouTubeAudio = async (videoId: string) => {
  const ytId = parseId(videoId)
  const url = `https://www.youtube.com/watch?v=${ytId}`
  const ytdlp = new YtDlp()
  const logger = getLogger()
  const outputPath = path.join(getConfig("musicCache"), ytId)

  if (!fs.existsSync(outputPath)) {
    try {
      logger.info(`Starting download for: ${ytId}`)

      // downloadAudio handles the extraction and conversion to mp3 automatically
      const result = await ytdlp
        .download(url)
        .filter("audioonly")
        .type("m4a")
        .quality(5)
        .extractAudio()
        .audioFormat("m4a")
        .output(outputPath)
        .embedThumbnail()
        .on("progress", (p) => logger.info(`Downloading ${url} Progress: ${p.percentage_str}%`))
        .run()

      const downloadedFile = result.filePaths.find((t: string) => {
        return t.toLowerCase().endsWith(".m4a")
      })

      if (downloadedFile) {
        fs.renameSync(downloadedFile, path.join(getConfig("musicCache"), `${ytId}.m4a`))
        fs.rmSync(outputPath, { recursive: true, force: true })
      }

      logger.info("Files:", result.filePaths)

      logger.info("Download complete")
    } catch (error) {
      logger.error("Failed to download audio:", error)
      throw error
    }
  }
  return youtubeProxyUrl(ytId)
}
