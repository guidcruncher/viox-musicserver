import { SnapserverOrchestrator } from "../../services/snapserver/snapserver.orchestrator"

export const unmuteAllClients = async (app: any) => {
  app.post(
    "/snapserver/clients/unmute",
    {
      schema: {
        tags: ["Mixer"],
        description: "Unmute all clients",
      },
    },
    async (_req: any, reply: any) => {
      const snap = new SnapserverOrchestrator()
      const result = await snap.unmuteAllClients()
      return reply.send({ ok: true, ...result })
    },
  )
}
