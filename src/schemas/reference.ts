export const AudioSourceSchema = {
  type: "string",
  enum: ["spotify", "podverse", "radiobrowser", "tunein", "youtube", "local"], //
}

export const AudioSourceItemTypeSchema = {
  type: "string",
  enum: ["playlist", "folder", "track", "album", "episode", "show", "podcast", "station"], //
}

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
