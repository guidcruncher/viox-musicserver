import { historyRepository } from "../repositories/historyRepository"
import { UnifiedEvent } from "./types"

function saveToHistory(r: any): void {
  if (!r.uri) return

  historyRepository.create({
    id: r.uri,
    title: r.name,
    subtitle: (r.album_name ?? "") + r.artist_names ? " - " + r.artist_names.join(", ") : "",
    img: r.album_cover_url,
    type: "spotify",
    uri: r.uri,
    format: "",
    isFolder: false,
    country: "",
    bitrate: "",
  })
}

//
// SPOTIFY
//

export function normalizeSpotify(raw: any): UnifiedEvent[] {
  const base = { backend: "spotify" as const, raw }

  const metadata = {
    uri: raw.uri,
    context_uri: raw.context_uri,
    name: raw.name,
    artist_names: raw.artist_names,
    album_name: raw.album_name,
    album_cover_url: raw.album_cover_url,
    duration: raw.duration,
    position: raw.position,
  }

  switch (raw.event ?? raw.type) {
    case "playing":
      saveToHistory(metadata)
      return [
        {
          ...base,
          type: "track_start",
          ...metadata,
          resume: raw.resume,
          play_origin: raw.play_origin,
        },
      ]

    case "paused":
      return [
        {
          ...base,
          type: "track_pause",
          ...metadata,
          play_origin: raw.play_origin,
        },
      ]

    case "not_playing":
    case "stopped":
      return [
        {
          ...base,
          type: "track_stop",
          ...metadata,
        },
      ]

    case "metadata":
      return [
        {
          ...base,
          type: "track_change",
          ...metadata,
        },
      ]

    case "seek":
      return [
        {
          ...base,
          type: "seek",
          ...metadata,
          play_origin: raw.play_origin,
        },
      ]

    case "volume":
      return [
        {
          ...base,
          type: "volume_change",
          value: raw.value,
          max: raw.max,
        },
      ]

    case "shuffle_context":
      return [
        {
          ...base,
          type: "shuffle_change",
          value: raw.value,
        },
      ]

    case "repeat_context":
    case "repeat_track":
      return [
        {
          ...base,
          type: "repeat_change",
          value: raw.value,
        },
      ]

    default:
      return [
        {
          ...base,
          type: "raw",
        },
      ]
  }
}

//
// MPD
//

interface MPDStatus {
  state: "play" | "pause" | "stop"
  volume?: number
  repeat?: number
  random?: number
  [key: string]: any
}

interface MPDSong {
  file?: string
  title?: string
  name?: string
  artist?: string
  album?: string
  imageUrl?: string
  [key: string]: any
}

export function normalizeMPD(
  changed: string,
  status: MPDStatus,
  song: MPDSong | null,
): UnifiedEvent[] {
  const base = { backend: "mpd" as const, raw: { changed, status, song } }
  const events: UnifiedEvent[] = []

  if (changed === "player") {
    if (status.state === "play") {
      events.push({
        ...base,
        type: "track_start",
        state: status.state,
        song,
      })
    } else if (status.state === "pause") {
      events.push({
        ...base,
        type: "track_pause",
        state: status.state,
        song,
      })
    } else if (status.state === "stop") {
      events.push({
        ...base,
        type: "track_stop",
        state: status.state,
        song,
      })
    }

    if (song) {
      events.push({
        ...base,
        type: "track_change",
        song,
      })
    }
  }

  if (changed === "mixer" && typeof status.volume === "number") {
    events.push({
      ...base,
      type: "volume_change",
      value: status.volume,
    })
  }

  if (changed === "options") {
    events.push({
      ...base,
      type: "shuffle_change",
      value: status.random === 1,
    })
    events.push({
      ...base,
      type: "repeat_change",
      value: status.repeat === 1,
    })
  }

  if (!events.length) {
    events.push({
      ...base,
      type: "raw",
    })
  }

  return events
}
