import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { GetPresetsSchema, LoadPresetSchema, SetBandSchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerEqualizerRoutes(app: FastifyInstance, backend: VioxBackend) {
  let lastFilter = ""
  logger.info("Registering equalizer routes")

  app.get("/api/eq", async (_req, res) => {
    const levels = await backend.equalizer.getCurrentLevels()
    res.send(levels)
  })

  app.get("/api/eq/reverb", async (_req, res) => {
    res.status(200).send(backend.reverb.getConvolverPresets())
  })

  app.post("/api/eq/reverb", async (req, res) => {
    const { filename, gain, delay } = req.body as any
    lastFilter = filename
    backend.reverb.changeIR(filename, gain, delay)
    res.status(200).send({ enabled: true, filename, gain, delay })
  })

  app.post("/api/eq/reverb/:toggle", async (req, res) => {
    const { toggle } = req.params as any

    if (toggle === "on") {
      backend.reverb.enableFilter(lastFilter)
      res.status(200).send({ enabled: true, filename: lastFilter, gain: 0.95, delay: 0 })
    } else {
      backend.reverb.disableFilter()
      res.status(200).send({ enabled: false, filename: "bypass.wav", gain: 1, delay: 0 })
    }
  })

  app.get(
    "/api/eq/presets",
    {
      schema: GetPresetsSchema,
    },
    async (_req, res) => {
      const presets = await backend.equalizer.getAvailablePresets()
      res.send(presets)
    },
  )

  app.post(
    "/api/eq/preset/:name",
    {
      schema: LoadPresetSchema,
    },
    async (req, res) => {
      const { name } = req.params as any
      await backend.equalizer.loadPreset(name)
      res.send({ ok: true })
    },
  )

  app.post(
    "/api/eq/set-band",
    {
      schema: SetBandSchema,
    },
    async (req, res) => {
      const body = req.body as { band: string; gain: number }
      await backend.equalizer.setBand(body.band, body.gain)
      res.send({ ok: true })
    },
  )
}

//
