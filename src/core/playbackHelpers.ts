import type { PlaybackError, PlaybackErrorCode } from "@/types"

export function makeError(
  code: PlaybackErrorCode,
  message: string,
  cause?: unknown,
): PlaybackError {
  return { code, message, cause }
}
