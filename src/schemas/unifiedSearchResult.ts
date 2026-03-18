export const UnifiedSearchResultSchema = {
  type: "object",
  required: ["id", "backend", "title", "type", "uri"],
  properties: {
    id: { type: "string" },
    backend: {
      type: "string",
      enum: ["podverse", "radio", "spotify", "local", "youtube"],
    },
    title: { type: "string" },
    artist: { type: "string" },
    album: { type: "string" },
    duration: { type: "number" },
    artworkUrl: { type: "string" },
    type: { type: "string" },
    format: { type: "string" },
    uri: { type: "string" },
    meta: {
      type: "object",
      additionalProperties: true,
    },
    score: { type: "number" },
    favourite: { type: "boolean" },
  },
  additionalProperties: false,
}
