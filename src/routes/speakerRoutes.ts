import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerSpeakerRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/speakers", async (_req, res) => {
    const speakers = await backend.speakers.getAllSpeakers()
    res.send(speakers)
  })

  app.post("/speakers/mute", async (req, res) => {
    await backend.speakers.muteAll()
    res.send({ ok: true })
  })

  app.post("/speakers/unmute", async (req, res) => {
    await backend.speakers.unmuteAll()
    res.send({ ok: true })
  })

  app.post("/speakers/:volume", async (req, res) => {
    const { volume } = req.params as any
    await backend.speakers.setVolumeAll(volume)
    res.send({ ok: true })
  })

  app.post("/speakers/:id/mute", async (req, res) => {
    const { id } = req.params as any
    await backend.speakers.mute(id)
    res.send({ ok: true })
  })

  app.post("/speakers/:id/unmute", async (req, res) => {
    const { id } = req.params as any
    await backend.speakers.unmute(id)
    res.send({ ok: true })
  })

  app.post("/speakers/:id/:volume", async (req, res) => {
    const { id, volume } = req.params as any
    await backend.speakers.setVolume(id, volume)
    res.send({ ok: true })
  })
}
