export const PlaybackErrorSchema = {
$id: "PlaybackError",
  type: "object",
  required: ["code", "message"], //
  properties: {
    code: {
      type: "string",
      enum: ["UNAVAILABLE", "NOT_AUTHORIZED", "NETWORK", "BACKEND_ERROR", "UNSUPPORTED_FORMAT"],
    },
    message: { type: "string" },
    cause: { type: "object", additionalProperties: true },
  },
}
