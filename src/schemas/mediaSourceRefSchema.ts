import { AudioSourceItemTypeSchema,AudioSourceSchema } from "./index"

export const MediaSourceRefSchema = {
  $id: "mediaSourceRef",
  type: "object",
  required: ["source", "itemType", "sourceId"], //
  properties: {
    source: AudioSourceSchema,
    itemType: AudioSourceItemTypeSchema,
    sourceId: { type: "string" },
    parentSourceId: { type: "string" },
    uri: { type: "string" },
  },
}
