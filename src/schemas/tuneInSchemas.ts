export const BrowseTuneInSchema = {
  params: {
    type: "object",
    properties: {
      guideId: { type: "string" },
    },
    required: ["guideId"],
  },
  response: {
    200: {
      type: "array",
      items: { $ref: "MediaItem#" },
    },
  },
}
