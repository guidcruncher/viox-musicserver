import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerMusicBrainzRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Musicbrainz routes")

  app.get("/api/musicbrainz/:isrc", async (req: any, reply: any) => {
    const { isrc } = req.params as any
    const res = await backend.musicBrainzClient.getMbidRecordFromIsrc(isrc)
    return reply.status(200).send(res)
  })
}
