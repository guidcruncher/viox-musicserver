export const ListLibrarySchema = {
  query: {
    type: "object",
    properties: {
      offset: { type: "string", pattern: "^[0-9]+$" },
      limit: { type: "string", pattern: "^[0-9]+$" },
      type: {
        oneOf: [
          { $ref: "AudioSourceItemType#" },
          {
            type: "array",
            items: { $ref: "AudioSourceItemType#" },
          },
        ],
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

export const GetLibraryItemSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: { $ref: "MediaItem#" },
  },
}
