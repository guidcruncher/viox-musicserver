import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import type { AudioSource, VioxBackend } from "@/types"
import { Capabilities } from "@/types"

export function registerRadioRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering version routes")

  app.get("/api/radio", async (_req: any, reply: any) => {
    const res = []

    for (const key of Object.keys(Capabilities.audioSources)) {
      const caps = Capabilities.audioSources[key as AudioSource]

      if (caps.group === "radio") {
        res.push({
          id: key,
          name: caps.name,
          sourceId: caps.initialBrowseSourceId || "",
          default: key === "tunein",
        })
      }
    }

    reply.send(res)
  })
}
