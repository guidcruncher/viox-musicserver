import crypto from "crypto";
import { MediaSourceRef } from "@/types"

export function makeVioxId(ref: MediaSourceRef): string {
  const json = JSON.stringify(ref).trim();
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 16);
  return `viox:${hash}`;
}
