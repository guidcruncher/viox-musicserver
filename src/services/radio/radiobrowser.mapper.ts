// radiobrowser.mapper.ts
import { MediaItem } from "../../types/media-types"

export const mapRadioBrowserStation = (station: any): MediaItem => ({
  id: `radio:radiobrowser:${station.stationuuid}`,
  title: station.name,
  subtitle: station.tags?.split(",").slice(0, 3).join(", ") ?? "",
  img: station.favicon || undefined,
  artist: "",
  type: "radio",
  uri: station.url_resolved || station.url,
  format: station.codec,
  isFolder: false,
  country: station.countrycode,
  bitrate: station.bitrate ? `${station.bitrate}kbps` : undefined,
})
