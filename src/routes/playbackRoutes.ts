import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerPlaybackRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.post("/api/play", async (req, res) => {
    const body = req.body as { id: string }
    await backend.playback.play(body.id)
    res.send({ ok: true })
  })

  app.post("/api/pause", async (_req, res) => {
    await backend.playback.pause()
    res.send({ ok: true })
  })

  app.post("/api/resume", async (_req, res) => {
    await backend.playback.resume()
    res.send({ ok: true })
  })

  app.post("/api/stop", async (_req, res) => {
    await backend.playback.stop()
    res.send({ ok: true })
  })

  app.post("/api/seek", async (req, res) => {
    const body = req.body as { position: number }
    await backend.playback.seek(body.position)
    res.send({ ok: true })
  })
}
