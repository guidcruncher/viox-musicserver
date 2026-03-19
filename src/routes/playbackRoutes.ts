import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerPlaybackRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.post("/play", async (req, res) => {
    const body = req.body as { id: string }
    await backend.playback.play(body.id)
    res.send({ ok: true })
  })

  app.post("/pause", async (_req, res) => {
    await backend.playback.pause()
    res.send({ ok: true })
  })

  app.post("/resume", async (_req, res) => {
    await backend.playback.resume()
    res.send({ ok: true })
  })

  app.post("/stop", async (_req, res) => {
    await backend.playback.stop()
    res.send({ ok: true })
  })

  app.post("/seek", async (req, res) => {
    const body = req.body as { position: number }
    await backend.playback.seek(body.position)
    res.send({ ok: true })
  })
}
