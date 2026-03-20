import type { FastifyInstance } from "fastify"

import { GetPresetsSchema, LoadPresetSchema, SetBandSchema } from "@/schemas"
import type { VioxBackend } from "@/types"

export function registerEqualizerRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get(
    "/api/eq",
    async (_req, res) => {
      const levels = await backend.equalizer.getCurrentLevels()
      res.send(levels)
    },
  )
  
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
