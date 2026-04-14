import type { FastifyInstance } from "fastify"

import { getProxyService } from "@/infra/networking/proxyFactory"
import { logger } from "@/logger"
import { PlayRequestSchema, SeekRequestSchema, SuccessResponseOnlySchema } from "@/schemas"
import type { VioxBackend } from "@/types"
import { isSafeExternalUrl } from "@/utils/urlValidator"

export function registerPlaybackRoutes(app: FastifyInstance, backend: VioxBackend) {
  logger.info("Registering Playback routes")

  app.post("/api/play", { schema: PlayRequestSchema }, async (req, res) => {
    const body = req.body as { id: string; parent: string }
    const track = await backend.playback.enqueueAndPlay(body.id, body.parent)
    res.send({ ok: true, track })
  })

  app.post("/api/previous", async (_req, res) => {
    const track = await backend.playback.previous()
    res.send({ ok: true, track })
  })

  app.post("/api/next", async (_req, res) => {
    const track = await backend.playback.next()
    res.send({ ok: true, track })
  })

  app.post("/api/pause", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.pause()
    res.send({ ok: true })
  })

  app.post("/api/resume", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.resume()
    res.send({ ok: true })
  })

  app.post("/api/stop", { schema: SuccessResponseOnlySchema }, async (_req, res) => {
    await backend.playback.stop()
    await backend.queue.clear()
    res.send({ ok: true })
  })

  app.post("/api/seek", { schema: SeekRequestSchema }, async (req, res) => {
    const body = req.body as { position: number }
    await backend.playback.seek(body.position)
    res.send({ ok: true })
  })

  app.get("/api/proxy", async (req, reply) => {
    const { url, source } = req.query as any

    if (!source) {
      reply.code(400).send("Missing source parameter")
      return
    }

    if (!url) {
      reply.code(400).send("Missing ?url parameter")
      return
    }

    if (!isSafeExternalUrl(url)) {
      reply.code(400).send("Invalid or disallowed URL")
      return
    }

    try {
      const proxyService = getProxyService(source)
      if (!proxyService) {
        reply.code(400).send(`Cannot determine Proxy to use for "${source}"`)
        return
      }
      const { stream, contentType, abort } = await proxyService.stream(url)

      reply.header("Content-Type", contentType)

      reply.raw.on("close", () => abort())

      return reply.send(stream)
    } catch (err: any) {
      reply.code(502).send(err.message)
    }
  })
}
