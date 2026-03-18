// src/routes/eq/setGain.ts
import { equalizerController } from "../../services/mixer/equalizerController"

export const setGain = async (app: any) => {
  app.post(
    "/eq/gain",
    {
      schema: {
        tags: ["Mixer"],
        summary: "Set global pre-amp gain multiplier",
        body: {
          type: "object",
          properties: {
            value: { type: "number", minimum: 0, maximum: 1 },
          },
          required: ["value"],
        },
      },
    },
    async (req: any) => {
      const { value } = req.body as { value: number }

      equalizerController.setGain(value)
    },
  )
}
