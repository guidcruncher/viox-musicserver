type Backend = "spotify" | "local" | "radio" | "podverse" | "youtube"

type Type =
  | "track"
  | "album"
  | "playlist"
  | "show"
  | "episode"
  | "podcast"
  | "file"
  | "radiobrowser"
  | "tunein"

interface MusicId {
  backend: Backend
  type: Type
  id: string
}

export function parseId(id: string): MusicId | undefined {
  const opts = id.split(":")
  if (opts.length != 3) return undefined

  return {
    backend: opts[0] as Backend,
    type: opts[1] as Type,
    id: opts[2],
  }
}

export function extractId(id: string): string {
  const opts = id.split(":")
  if (opts.length != 3) return id

  return opts[2]
}
