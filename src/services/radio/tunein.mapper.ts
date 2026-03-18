// tunein.mapper.ts
import { MediaItem } from "../../types/media-types"
import { TuneInStation } from "./types"

export const mapTuneInStation = (
  station: TuneInStation,
  opts?: { country?: string },
): MediaItem => ({
  id: `radio:tunein:${station.id}`,
  title: station.text,
  subtitle: station.playing ?? station.subtext ?? "",
  img: station.image,
  artist: undefined,
  type: "radio",
  uri: station.url,
  format: "audio/stream",
  isFolder: false,
  country: opts?.country,
  bitrate: station.bitrate ? String(station.bitrate) : undefined,
})
