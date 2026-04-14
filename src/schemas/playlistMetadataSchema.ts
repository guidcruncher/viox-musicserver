export const PlaylistMetadataSchema = {
  $id: "PlaylistMetadata",
  type: "object",
  required: ["id", "sourceRef", "name", "totalItems"], //
  properties: {
    id: { type: "string" },
    sourceRef: { $ref: "MediaSourceRef#" },
    name: { type: "string" },
    description: { type: "string" },
    imageUrl: { type: "string" },
    ownerName: { type: "string" },
    totalItems: { type: "integer" },
    library: { type: "boolean" },
  },
}
