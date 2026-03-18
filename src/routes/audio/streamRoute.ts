import { FastifyInstance, FastifySchema } from "fastify"

import { getLogger } from "../../logger"
import { streamService } from "../../services/audio/streamService"

export async function streamRoute(app: FastifyInstance) {
  const logger = getLogger()

  const streamSchema: FastifySchema = {
    summary: "Smart Live Audio Stream",
    tags: ["Media"],
    querystring: {
      type: "object",
      properties: {
        format: { type: "string", enum: ["aac", "mp3", "mp4"] },
      },
    },
  }

  app.get("/stream", { schema: streamSchema }, async (req, reply) => {
    // 1. Identify format via smart negotiation
    const format = streamService.negotiateFormat(
      (req.query as any).format,
      req.headers.accept,
      req.headers["user-agent"],
    )

    // 2. Setup Stream
    const { process: ffmpeg, config } = streamService.createStream(format)
    const headers = streamService.getHeaders(format)

    // 3. Write Response
    reply.raw.writeHead(200, headers)

    if (config.primingFrame) {
      reply.raw.write(config.primingFrame)
    }

    ffmpeg.stdout.pipe(reply.raw)

    // 4. Cleanup
    const cleanup = () => {
      streamService.stopStream(ffmpeg)
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
