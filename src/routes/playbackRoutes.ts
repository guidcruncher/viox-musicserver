import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import { PlayRequestSchema, SeekRequestSchema, SuccessResponseOnlySchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerPlaybackRoutes(app: FastifyInstance, backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering Playback routes")

  app.post("/api/play", { schema: PlayRequestSchema }, async (req, res) => {
    const body = req.body as { id: string }
    await backend.playback.play(body.id)
    res.send({ ok: true })
  })

  app.post("/api/pause", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.pause()
    res.send({ ok: true })
  })

  app.post("/api/resume", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.resume()
    res.send({ ok: true })
  })

  app.post("/api/stop", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.stop()
    res.send({ ok: true })
  })

  app.post("/api/seek", { schema: SeekRequestSchema }, async (req, res) => {
    const body = req.body as { position: number }
    await backend.playback.seek(body.position)
    res.send({ ok: true })
  })
}
