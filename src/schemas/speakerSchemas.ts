const setVolumeSchema = {
  type: "object",
  required: ["volume"],
  properties: {
    volume: { type: "number" },
  },
  additionalProperties: false,
}

export const SpeakerParamsSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: { 200: { $ref: "SuccessResponse#" } },
}

export const SpeakerVolumeSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  body: setVolumeSchema,
  response: { 200: { $ref: "SuccessResponse#" } },
}

export const SpeakerAllVolumeSchema = {
  body: setVolumeSchema,
  response: { 200: { $ref: "SuccessResponse#" } },
}
