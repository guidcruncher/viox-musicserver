import type { FastifyInstance } from "fastify"
import type { VioxBackend } from "@/types"

export function registerEqualizerRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/eq/preset", async (_req, res) => {
    const preset = await backend.equalizer.getPreset()
    res.send(preset)
  })

  app.post("/eq/set-band", async (req, res) => {
    const body = req.body as { band: number; gain: number }
    await backend.equalizer.setBand(body.band, body.gain)
    res.send({ ok: true })
  })
}
