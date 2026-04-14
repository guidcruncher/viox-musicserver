import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { VioxBackend } from "@/types"

export function registerArtistRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Artist routes")

  app.get("/api/artist", async (req: any, reply: any) => {
    const { name } = req.query as any
    const artist = await backend.artist.getArtist(name)
    if (!artist) {
      return reply.status(404).send()
    }
    reply.status(200).send(artist)
  })

  app.get("/api/artist/albums", async (req: any, reply: any) => {
    const { limit, offset, name } = req.query as any
    const artist = await backend.artist.getArtist(name)

    if (!artist) {
      return reply.status(404).send()
    }

    const res = await backend.artist.getArtistAlbums(artist.sourceRef, offset, limit)
    reply.status(200).send(res)
  })

  app.get("/api/artist/tracks", async (req: any, reply: any) => {
    const { limit, offset, name } = req.query as any
    const artist = await backend.artist.getArtist(name)
    if (!artist) {
      return reply.status(404).send()
    }
    const res = await backend.artist.getArtistTracks(artist.sourceRef, offset, limit)
    reply.status(200).send(res)
  })
}
