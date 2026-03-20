import { FastifyInstance } from "fastify"

import {
  AudioSourceItemTypeSchema,
  AudioSourceSchema,
  MediaItemSchema,
  MediaSourceRefSchema,
  PlaybackErrorSchema,
  PlaybackStateSchema,
  PlaylistMetadataSchema,
  SuccessResponseSchema,
} from "./index"

export const registerSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(SuccessResponseSchema)
  fastify.addSchema(MediaSourceRefSchema)
  fastify.addSchema(MediaItemSchema)
  fastify.addSchema(PlaylistMetadataSchema)
  fastify.addSchema(AudioSourceSchema)
  fastify.addSchema(AudioSourceItemTypeSchema)
  fastify.addSchema(PlaybackErrorSchema)
  fastify.addSchema(PlaybackStateSchema)
}
