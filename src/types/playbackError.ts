export type PlaybackErrorCode =
  | "UNAVAILABLE"
  | "NOT_AUTHORIZED"
  | "NETWORK"
  | "BACKEND_ERROR"
  | "UNSUPPORTED_FORMAT";

export interface PlaybackError {
  code: PlaybackErrorCode;
  message: string;
  cause?: unknown;
}
