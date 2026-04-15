import crypto from "crypto"
import path from "path"

import { config } from "@/config"

export const hashAudioFilename = (url: string): string => {
  const hash = crypto.createHash("sha256").update(url).digest("hex")
  return path.join(config.cacheFolder, `proxy_cache_${hash}.mp3`)
}

export const hashImageFilename = (url: string): string => {
  const hash = crypto.createHash("sha256").update(url).digest("hex")
  return path.join(config.cacheFolder, `albumart_cache_${hash}`)
}
