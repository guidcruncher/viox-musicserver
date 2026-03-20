export const MediaItemSchema = {
  $id: "mediaItem",
  type: "object",
  required: ["id", "sourceRef", "title"], //
  properties: {
    id: { type: "string" },
    sourceRef: { $ref: "mediaSourceRef#" },
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

export const PlaylistMetadataSchema = {
  $id: "playlistMetadata",
  type: "object",
  required: ["id", "sourceRef", "name", "totalItems"], //
  properties: {
    id: { type: "string" },
    sourceRef: { $ref: "mediaSourceRef#" },
    name: { type: "string" },
    description: { type: "string" },
    imageUrl: { type: "string" },
    ownerName: { type: "string" },
    totalItems: { type: "integer" },
  },
}
