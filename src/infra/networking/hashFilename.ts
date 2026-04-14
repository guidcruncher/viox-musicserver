import crypto from "crypto"
import path from "path"
import { getConfig } from "@/config"

export const hashAudioFilename = (url: string): string => {
     const hash = crypto.createHash("sha256").update(url).digest("hex")
    return path.join( getConfig("cacheFolder"), `proxy_cache_${hash}.mp3`)
  }

export const hashImageFilename = (url: string): string => {
     const hash = crypto.createHash("sha256").update(url).digest("hex")
    return path.join( getConfig("cacheFolder"), `albumart_cache_${hash}.mp3`)
  }
