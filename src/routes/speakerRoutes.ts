import type { FastifyInstance } from "fastify"

import { getLogger } from "@/logger"
import {
  SpeakerAllVolumeSchema,
  SpeakerParamsSchema,
  SpeakersResponseSchema,
  SpeakerVolumeSchema,
  SuccessResponseOnlySchema,
} from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerSpeakerRoutes(app: FastifyInstance, backend: VioxBackend) {
  const logger = getLogger()
  logger.info("Registering Speaker routes")

  app.get("/api/speakers", { schema: SpeakersResponseSchema }, async (_req, res) => {
    const speakers = await backend.speakers.getAllSpeakers()
    res.send(speakers)
  })

  app.post("/api/speakers/mute", { schema: SuccessResponseOnlySchema }, async (req, res) => {
    await backend.speakers.muteAll()
    res.send({ ok: true })
  })

  app.post("/api/speakers/unmute", { schema: SuccessResponseOnlySchema }, async (req, res) => {
    await backend.speakers.unmuteAll()
    res.send({ ok: true })
  })

  app.post("/api/speakers/volume", { schema: SpeakerAllVolumeSchema }, async (req, res) => {
    const { volume } = req.body as any
    await backend.speakers.setVolumeAll(volume)
    res.send({ ok: true })
  })

  app.post("/api/speaker/mute/:id", { schema: SpeakerParamsSchema }, async (req, res) => {
    const { id } = req.params as any
    await backend.speakers.mute(id)
    res.send({ ok: true })
  })

  app.post("/api/speaker/unmute/:id", { schema: SpeakerParamsSchema }, async (req, res) => {
    const { id } = req.params as any
    await backend.speakers.unmute(id)
    res.send({ ok: true })
  })

  app.post("/api/speaker/volume/:id", { schema: SpeakerVolumeSchema }, async (req, res) => {
    const { id } = req.params as any
    const { volume } = req.body as any
    await backend.speakers.setVolume(id, volume)
    res.send({ ok: true })
  })
}
