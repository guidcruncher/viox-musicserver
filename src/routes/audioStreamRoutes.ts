import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { StreamerSchema } from "@/schemas"
import { AudioStreamService } from "@/services/audioService"
import type { VioxBackend } from "@/types"

export function registerAudioStreamRoutes(app: FastifyInstance, _backend: VioxBackend) {
  const streamerService = new AudioStreamService()
  logger.info("Registering version routes")

  app.get("/api/stream", { schema: StreamerSchema }, async (req: any, reply: any) => {
    // 1. Identify format via smart negotiation
    const format = streamerService.negotiateFormat(
      (req.query as any).format,
      req.headers.accept,
      req.headers["user-agent"],
    )

    // 2. Setup Stream
    const { process: ffmpeg, config } = streamerService.createStream(format)
    const headers = streamerService.getHeaders(format)

    // 3. Write Response
    reply.raw.writeHead(200, headers)

    if (config.primingFrame) {
      reply.raw.write(config.primingFrame)
    }

    ffmpeg.stdout.pipe(reply.raw)

    // 4. Cleanup
    const cleanup = () => {
      streamerService.stopStream(ffmpeg)
      if (!reply.raw.writableEnded) reply.raw.end()
    }

    req.raw.on("close", cleanup)
    ffmpeg.on("error", (err: any) => {
      logger.error(`FFmpeg Error: ${err.message}`)
      cleanup()
    })

    return reply
  })
}
