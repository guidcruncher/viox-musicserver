export const SpeakerParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  response: { 200: { $ref: 'SuccessResponse#' } }
};

export const SpeakerVolumeSchema = {
  params: {
    type: 'object',
    required: ['id', 'volume'],
    properties: {
      id: { type: 'string' },
      volume: { type: 'string', pattern: '^[0-9]+$' }
    }
  },
  response: { 200: { $ref: 'SuccessResponse#' } }
};
