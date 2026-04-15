export const PlayRequestSchema = {
  body: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
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
