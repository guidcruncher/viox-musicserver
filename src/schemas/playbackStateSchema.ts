import { PlaybackErrorSchema } from "./index"

export const PlaybackStateSchema = {
  $id: "playbackState",
  oneOf: [
    {
      type: "object",
      properties: { type: { const: "idle" } },
      required: ["type"],
    },
    {
      type: "object",
      properties: {
        type: { const: "loading" },
        item: { $ref: "mediaItem#" },
      },
      required: ["type", "item"],
    },
    {
      type: "object",
      properties: {
        type: { const: "playing" },
        item: { $ref: "mediaItem#" },
        positionMs: { type: "number" },
      },
      required: ["type", "item", "positionMs"],
    },
    {
      type: "object",
      properties: {
        type: { const: "paused" },
        item: { $ref: "mediaItem#" },
        positionMs: { type: "number" },
      },
      required: ["type", "item", "positionMs"],
    },
    {
      type: "object",
      properties: {
        type: { const: "ended" },
        item: { $ref: "mediaItem#" },
      },
      required: ["type", "item"],
    },
    {
      type: "object",
      properties: {
        type: { const: "error" },
        error: PlaybackErrorSchema,
      },
      required: ["type", "error"],
    },
  ],
}
