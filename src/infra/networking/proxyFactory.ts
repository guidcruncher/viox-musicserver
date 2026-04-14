import { AudioSource } from "@/types"

import { DiskProxyService } from "./diskProxyService"
import { StreamProxyService } from "./streamProxyService"
import { ProxyService } from "./types/proxyService"

export const getProxyService = (source: AudioSource): ProxyService | undefined => {
  const maxRedirects = 5
  const bufferSizeMb = 5

  switch (source) {
    case "podverse":
      return new DiskProxyService()
    case "radiobrowser":
      return new StreamProxyService(maxRedirects, bufferSizeMb)
    case "tunein":
      return new StreamProxyService(maxRedirects, bufferSizeMb)
    case "stream":
      return new StreamProxyService(maxRedirects, bufferSizeMb)
  }

  return undefined
}
