import crypto from "crypto"

import { MediaSourceRef, MediaStore } from "@/types"

interface VioxIdRef {
  source: string
  type: string
  id: string
}

export const makeVioxId = (ref: MediaSourceRef, type: MediaStore): string => {
  const json = JSON.stringify({
    source: ref.source,
    itemType: ref.itemType,
    sourceId: ref.sourceId,
    uri: ref.uri ?? "",
  }).trim()
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 16)
  return `viox:${type}:${hash}`
}

export const parseVioxId = (vioxId: string): VioxIdRef => {
  const parts = vioxId.split(":")
  if (parts.length !== 3 || parts[0] !== "viox") {
    throw new Error(`Invalid Viox ID: ${vioxId}`)
  }

  return {
    source: parts[0],
    type: parts[1],
    id: parts[2],
  }
}
