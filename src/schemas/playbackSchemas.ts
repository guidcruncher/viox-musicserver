export const PlayRequestSchema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      ids: { type: "array", items: { type: "string" } },
      parent: { type: "string" },
    },
  },
}

export const SeekRequestSchema = {
  body: {
    type: "object",
    required: ["position"],
    properties: {
      position: { type: "number" },
    },
  },
  response: { 200: { $ref: "SuccessResponse#" } },
}
