export const BackendStatusSchema = {
  response: {
    200: {
      type: 'object',
      additionalProperties: true // Flexible depending on VioxBackend.status.get()
    }
  }
};

export const BackendsListSchema = {
  response: {
    200: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};
