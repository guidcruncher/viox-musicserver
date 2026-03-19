import type { FastifyInstance } from "fastify"

import type { VioxBackend } from "@/types"

export function registerEqualizerRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/api/eq/presets", async (_req, res) => {
    const presets = await backend.equalizer.getAvailablePresets()
    res.send(presets)
  })

  app.post("/api/eq/preset/:name", async (req, res) => {
    const { name } = req.params as any
    await backend.equalizer.loadPreset(name)
    res.send({ ok: true })
  })

  app.post("/api/eq/set-band", async (req, res) => {
    const body = req.body as { band: string; gain: number }
    await backend.equalizer.setBand(body.band, body.gain)
    res.send({ ok: true })
  })
}
