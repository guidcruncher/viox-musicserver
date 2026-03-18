// src/routes/eq/getStatus.ts
import { equalizerController } from "../../services/mixer/equalizerController"

export const getStatus = async (app: any) => {
  app.get(
    "/eq/status",
    {
      schema: {
        tags: ["Mixer"],
        summary: "Get current EQ band levels",
      },
    },
    async (req: any, reply: any) => {
      const levels = equalizerController.getCurrentLevels()
      return reply.send(levels)
    },
  )
}
