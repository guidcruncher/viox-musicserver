
export const PlaybackStateSchema = {
  $id: "PlaybackState",
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
        item: { $ref: "MediaItem#" },
      },
      required: ["type", "item"],
    },
    {
      type: "object",
      properties: {
        type: { const: "playing" },
        item: { $ref: "MediaItem#" },
        positionMs: { type: "number" },
      },
      required: ["type", "item", "positionMs"],
    },
    {
      type: "object",
      properties: {
        type: { const: "paused" },
        item: { $ref: "MediaItem#" },
        positionMs: { type: "number" },
      },
      required: ["type", "item", "positionMs"],
    },
    {
      type: "object",
      properties: {
        type: { const: "ended" },
        item: { $ref: "MediaItem#" },
      },
      required: ["type", "item"],
    },
    {
      type: "object",
      properties: {
        type: { const: "error" },
        error: {$ref: "PlaybackErrorSchema#"},
      },
      required: ["type", "error"],
    },
  ],
}
