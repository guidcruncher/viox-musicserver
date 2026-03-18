import { SnapserverOrchestrator } from "../../services/snapserver/snapserver.orchestrator"

export const getStatus = async (app: any) => {
  app.get(
    "/snapserver/status",
    {
      schema: {
        tags: ["Mixer"],
        description: "Get speaker system status",
      },
    },
    async (_req: any, reply: any) => {
      const snap = new SnapserverOrchestrator()
      const status = await snap.getFullStatus()
      return reply.send(status)
    },
  )

  app.get(
    "/snapserver/speakers",
    {
      schema: {
        tags: ["Mixer"],
        description: "Get speaker status",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "name", "ip", "volumePercent", "muted", "connected"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                ip: { type: "string" },
                volumePercent: { type: "number" },
                muted: { type: "boolean" },
                connected: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    async (_req: any, reply: any) => {
      const snap = new SnapserverOrchestrator()
      const status = await snap.getSpeakers()
      return reply.send(status)
    },
  )
}
