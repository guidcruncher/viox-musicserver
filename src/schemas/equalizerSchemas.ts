export const GetPresetsSchema = {
  response: {
    200: {
      type: "array",
      items: { type: "string" },
    },
  },
}

export const LoadPresetSchema = {
  params: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
    },
  },
  response: { 200: { $ref: "SuccessResponse#" } },
}

export const SetBandSchema = {
  body: {
    type: "object",
    required: ["band", "gain"],
    properties: {
      band: { type: "string" },
      gain: { type: "number" },
    },
  },
  response: { 200: { $ref: "SuccessResponse#" } },
}
