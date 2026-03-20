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
