import type { FastifyInstance } from "fastify"
import type { VioxBackend } from "@/types"

export function registerSpeakerRoutes(app: FastifyInstance, backend: VioxBackend) {
  app.get("/speakers", async (_req, res) => {
    const speakers = await backend.speakers.list()
    res.send(speakers)
  })

  app.post("/speakers/select", async (req, res) => {
    const body = req.body as { id: string }
    await backend.speakers.select(body.id)
    res.send({ ok: true })
  })
}
