export const MediaSourceRefSchema = {
  $id: "MediaSourceRef",
  type: "object",
  required: ["source", "itemType", "sourceId"], //
  properties: {
    source: { $ref: "AudioSource#" },
    itemType: { $ref: "AudioSourceItemType#" },
    sourceId: { type: "string" },
    parentSourceId: { type: "string" },
    uri: { type: "string" },
  },
}
