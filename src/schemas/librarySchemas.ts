export const ListLibrarySchema = {
  query: {
    type: "object",
    properties: {
      offset: { type: "string", pattern: "^[0-9]+$" },
      limit: { type: "string", pattern: "^[0-9]+$" },
      type: {
        type: "array",
        items: { $ref: "AudioSourceItemType#" },
      },
    },
  },
  response: {
    200: {
      type: "array",
      items: { $ref: "MediaItem#" },
    },
  },
}
