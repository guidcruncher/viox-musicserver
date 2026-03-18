import { MediaItem } from "../../types/media-types"

function getBestThumbnail(thumbnails: any[] = []) {
  if (!thumbnails || thumbnails.length === 0) return ""
  // youtubei.js thumbnails usually have width/height
  return thumbnails.reduce((best, t) => ((t.width ?? 0) > (best.width ?? 0) ? t : best)).url
}

export function mapYoutubeInfoToMediaItem(info: any): MediaItem {
  const basic = info.basic_info ?? {}

  // youtubei.js: basic.thumbnail is an array of {url, width, height}
  const img = getBestThumbnail(basic.thumbnail)
  const artist = basic.author ?? "Unknown Artist"

  // Using the built-in format selector
  const bestFormat = info.chooseFormat({ type: "audio", quality: "best" })

  return {
    id: `youtube:track:${basic.id}`,
    parent: "",
    title: basic.title ?? "Unknown Title",
    subtitle: artist,
    img: img,
    artist: artist,
    type: "song",
    uri: `youtube:track:${basic.id}`,
    format: bestFormat?.mime_type ?? "",
    isFolder: false,
    bitrate: bestFormat?.bitrate?.toString(),
    favourite: false,
  }
}

export function mapYoutubeItemToMediaItem(item: any): MediaItem | undefined {
  const node = item.bestMatch ?? item
  const original = item.original ?? {}

  if (!node) return undefined

  // youtubei.js nodes use .toString() for Title and Author objects
  const title = node.title?.toString() || node.name?.toString() || ""
  const id = node.id || node.video_id || node.endpoint?.payload?.videoId
  const artist = node.author?.name || node.artists?.[0]?.name || node.author?.toString() || ""
  const thumbnails = node.thumbnails || node.thumbnail?.contents || []

  return {
    id: id ? `youtube:${original.type || "song"}:${id}` : "",
    title: title,
    subtitle: artist,
    img: getBestThumbnail(thumbnails),
    artist: artist,
    type: original.type || "song",
    uri: id ? `youtube:${original.type || "song"}:${id}` : "",
    isFolder: ["artist", "album", "playlist"].includes(original.type),
  }
}
