export const SpeakersResponseSchema = {
  response: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        ip: { type: "string", format: "ipv4" },
        volumePercent: { type: "number", minimum: 0, maximum: 100 },
        muted: { type: "boolean" },
        connected: { type: "boolean" },
      },
      required: ["id", "name", "ip", "volumePercent", "muted", "connected"],
      additionalProperties: false,
    },
  },
}

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
