// src/routes/eq/getPresets.ts
import { equalizerController } from "../../services/mixer/equalizerController"

export const getPresets = async (app: any) => {
  app.get(
    "/eq/presets",
    {
      schema: {
        tags: ["Mixer"],
        summary: "List all available EQ preset names",
      },
    },
    async (req: any, reply: any) => {
      const presets = equalizerController.getAvailablePresetNames()
      return reply.send(presets)
    },
  )
}
