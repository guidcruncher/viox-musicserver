import crypto from "crypto"

import { KediaStore, MediaSourceRef } from "@/types"

export const makeVioxId = (ref: MediaSourceRef, type: MediaStore): string => {
  const json = JSON.stringify(ref).trim()
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 16)
  return `viox:${type}:${hash}`
}
