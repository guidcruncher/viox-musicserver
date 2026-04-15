import axios from "axios"

import { M3U8playlistNormalizer } from "@/core/normalizers/M3U8playlistNormalizer"
import { logger } from "@/logger"
import type { AudioSource, MediaItem } from "@/types"

const BBC_M3U_URL =
  "https://raw.githubusercontent.com/guidcruncher/viox-orchestration/refs/heads/main/utils/bbc-playlist-gen/bbc_playlist.m3u8"

export async function fetchAndNormalizeBBCPlaylist(
  source: AudioSource = "stream",
): Promise<MediaItem[]> {
  logger.debug(`Fetching BBC playlist from ${BBC_M3U_URL}`)

  const response = await axios.get(BBC_M3U_URL, {
    responseType: "text",
    transformResponse: (r) => r, // prevent axios JSON parsing
  })

  if (typeof response.data !== "string") {
    throw new Error("Unexpected playlist response type")
  }

  const playlistText = response.data.trim()
  logger.debug(`Fetched playlist length: ${playlistText.length} chars`)

  const items = await M3U8playlistNormalizer.convert(playlistText, source)
  logger.debug(`Normalised into ${items.length} MediaItems`)

  return items
}
