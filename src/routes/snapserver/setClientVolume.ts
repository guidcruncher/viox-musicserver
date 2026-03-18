import { getLogger } from "../../logger"
import { SnapserverOrchestrator } from "../../services/snapserver/snapserver.orchestrator"

export const setClientVolume = async (app: any) => {
  app.post(
    "/snapserver/client/volume",
    {
      schema: {
        tags: ["Mixer"],
        description: "Set volume for a given client",
        body: {
          type: "object",
          properties: {
            id: { type: "string" },
            percent: { type: "number" },
            muted: { type: "boolean" },
          },
          required: ["percent"],
        },
      },
    },
    async (req: any, reply: any) => {
      const logger = getLogger()
      try {
        const { id, percent, muted } = req.body as {
          id: string
          percent: number
          muted?: boolean
        }

        const snap = new SnapserverOrchestrator()
        await snap.setVolume(id, percent, muted ?? false)

        return reply.send({ ok: true })
      } catch (err) {
        logger.error("Error setting client volume", err)
        return reply.send({ ok: false })
      }
    },
  )

  app.post(
    "/snapserver/clients/volume",
    {
      schema: {
        tags: ["Mixer"],
        body: {
          type: "object",
          properties: {
            percent: { type: "number" },
          },
          required: ["percent"],
        },
      },
    },
    async (req: any, reply: any) => {
      const { percent } = req.body as {
        percent: number
      }

      const snap = new SnapserverOrchestrator()
      await snap.setAllVolume(percent)

      return reply.send({ ok: true })
    },
  )
}
