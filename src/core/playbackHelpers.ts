import type { PlaybackError, PlaybackErrorCode } from "@/types"

export const makeError = (
  code: PlaybackErrorCode,
  message: string,
  cause?: unknown,
): PlaybackError => {
  return { code, message, cause }
}
