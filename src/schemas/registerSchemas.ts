import { FastifyInstance } from "fastify"
import {
  MediaSourceRefSchema,
  MediaItemSchema,
  PlaylistMetadataSchema,
  AudioSourceSchema,
  AudioSourceItemTypeSchema,
  PlaybackErrorSchema,
  PlaybackStateSchema,
} from "./index"

export const registerSchemas = (fastify: FastifyInstance) => {
  fastify.addSchema(MediaSourceRefSchema)
  fastify.addSchema(MediaItemSchema)
  fastify.addSchema(PlaylistMetadataSchema)
  fastify.addSchema(AudioSourceSchema)
  fastify.addSchema(AudioSourceItemTypeSchema)
  fastify.addSchema(PlaybackErrorSchema)
  fastify.addSchema(PlaybackStateSchema)
  // Now you can use { $ref: 'mediaItem#' } in other schemas safely.
}
