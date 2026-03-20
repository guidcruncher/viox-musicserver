export const MediaItemSchema = {
  $id: "MediaItem",
  type: "object",
  required: ["id", "sourceRef", "title"], //
  properties: {
    id: { type: "string" },
    sourceRef: { $ref: "MediaSourceRef#" },
    title: { type: "string" },
    subtitle: { type: "string" },
    artist: { type: "string" },
    album: { type: "string" },
    imageUrl: { type: "string" },
    durationMs: { type: "number" },
    isLive: { type: "boolean" },
    description: { type: "string" },
    releaseDate: { type: "string" },
    explicit: { type: "boolean" },
  },
}
