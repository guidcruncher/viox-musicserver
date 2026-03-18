import { spotifyExcludeFields } from "@/config"

export function stripSpotifyFields<T>(data: T): T {
  const blacklist = new Set(spotifyExcludeFields)
  deepStripInPlace(data as any, blacklist)
  return data
}

function deepStripInPlace(value: any, blacklist: Set<string>): void {
  if (value === null || typeof value !== "object") {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      deepStripInPlace(item, blacklist)
    }
    return
  }

  for (const key of Object.keys(value)) {
    if (blacklist.has(key)) {
      delete value[key]
      continue
    }
    deepStripInPlace(value[key], blacklist)
  }
}
