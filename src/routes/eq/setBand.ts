// src/routes/eq/setBand.ts
import { equalizerController } from "../../services/mixer/equalizerController"

export const setBand = async (app: any) => {
  app.post(
    "/eq/band",
    {
      schema: {
        tags: ["Mixer"],
        summary: "Set a specific frequency band level",
        body: {
          type: "object",
          properties: {
            band: { type: "string" },
            level: { type: "number" },
          },
          required: ["band", "level"],
        },
      },
    },
    async (req: any) => {
      const { band, level } = req.body as { band: string; level: number }

      equalizerController.setBand(band, level)
    },
  )
}
