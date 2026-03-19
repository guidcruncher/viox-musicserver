import crypto from "crypto"

import { MediaStore, MediaSourceRef } from "@/types"

export const makeVioxId = (ref: MediaSourceRef | string, type: MediaStore): string => {
  const json = JSON.stringify(ref).trim()
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 16)
  return `viox:${type}:${hash}`
}
