
export const MediaSourceRefSchema = {
  $id: "MediaSourceRef",
  type: "object",
  required: ["source", "itemType", "sourceId"], //
  properties: {
    source: {$ref: "AudioSourceSchema#"},
    itemType:{ $ref: "AudioSourceItemTypeSchema#"},
    sourceId: { type: "string" },
    parentSourceId: { type: "string" },
    uri: { type: "string" },
  },
}
