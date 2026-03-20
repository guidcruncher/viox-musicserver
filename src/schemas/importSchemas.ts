export const SpotifyImportSchema = {
  params: {
    type: 'object',
    properties: {
      itemType: { 
        type: 'string', 
        enum: ['playlist', 'track', 'album', 'episode', 'show'] 
      }
    }
  },
  response: { 200: { $ref: 'SuccessResponse#' } }
};
