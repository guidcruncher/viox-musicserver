export const MediaItemSchema = {
  type: "object",
  required: ["id", "title", "subtitle", "type", "uri"],
  properties: {
    id: { type: "string" },
    parent: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    img: { type: "string" },
    artist: { type: "string" },
    type: {
      type: "string",
      enum: ["spotify", "radio", "local", "podcast", "artist", "album", "playlist", "episode"],
    },
    uri: { type: "string" },
    format: { type: "string" },
    isFolder: { type: "boolean" },
    country: { type: "string" },
    bitrate: { type: "string" },
    duration: { type: "number" },
    favourite: { type: "boolean" },
  },
  additionalProperties: true,
}
