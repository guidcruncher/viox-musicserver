export const SuccessResponseSchema = {
  $id: "SuccessResponse",
  type: "object",
  properties: {
    ok: { type: "boolean" },
  },
}

export const SuccessResponseOnlySchema = {
  response: {
    200: { $ref: "SuccessResponse#" },
  },
}
