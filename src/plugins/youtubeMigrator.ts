import fp from "fastify-plugin"

import { MigrationService } from "../services/youtube/migrationService"
import { YouTubeMusicMatcher } from "../services/youtube/youtubeMusicMatcher"

export default fp(async (fastify) => {
  const matcher = new YouTubeMusicMatcher()
  const service = new MigrationService(matcher)

  fastify.decorate("migrationService", service)
})

declare module "fastify" {
  interface FastifyInstance {
    migrationService: MigrationService
  }
}
