// src/routes/eq/loadPreset.ts
import { getLogger } from "../../logger"
import { equalizerController } from "../../services/mixer/equalizerController"

export const loadPreset = async (app: any) => {
  app.post(
    "/eq/preset/:name",
    {
      schema: {
        tags: ["Mixer"],
        summary: "Apply a named EQ preset",
        params: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              applied: { type: "string" },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const logger = getLogger()
      try {
        const { name } = req.params as { name: string }

        equalizerController.loadPreset(name)

        return reply.send({ status: "success", applied: name })
      } catch (err) {
        logger.error(`Error setting eq prwset ${name}`, err)
        return reply.send({ status: "error", applied: name })
      }
    },
  )
}
