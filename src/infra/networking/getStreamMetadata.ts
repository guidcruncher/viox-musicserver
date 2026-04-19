import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { logger } from "@/logger"

const execFileAsync = promisify(execFile)

interface IcyMetadata {
  icyName?: string
  icyGenre?: string
  icyUrl?: string
  streamTitle?: string
  raw: Record<string, string>
}

export async function getStreamMetadata(streamUrl: string): Promise<IcyMetadata | undefined> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "quiet",
      "-show_entries",
      "format_tags",
      "-of",
      "json",
      streamUrl,
    ])

    const parsed = JSON.parse(stdout)
    const tags: Record<string, string> = parsed?.format?.tags ?? {}

    const normalised: IcyMetadata = {
      icyName: tags["icy-name"],
      icyGenre: tags["icy-genre"],
      icyUrl: tags["icy-url"],
      streamTitle: tags["StreamTitle"] || tags["streamtitle"],
      raw: tags,
    }

    return normalised
  } catch {
    logger.error("Error fetching stream metadata")
    return undefined
  }
}
