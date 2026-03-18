import { SnapserverOrchestrator } from "../../services/snapserver/snapserver.orchestrator"

export const muteAllClients = async (app: any) => {
  app.post(
    "/snapserver/clients/mute",
    {
      schema: {
        tags: ["Mixer"],
        description: "Mute all clients",
      },
    },
    async (_req: any, reply: any) => {
      const snap = new SnapserverOrchestrator()
      const result = await snap.muteAllClients()
      return reply.send({ ok: true, ...result })
    },
  )
}
