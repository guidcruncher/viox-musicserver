// src/routes/podcastProxyRoute.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fs from "fs"
import path from "path"

import { getConfig } from "@/config"

import { getLogger } from "../../logger"
import { youtubePlayer } from "../../services/youtube/youtubePlayer"

interface ProxyQuery {
  id: string
}

export function proxyRoute(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ProxyQuery }>(
    "/proxy/youtube",
    {
      schema: {
        description: "Proxy a Youtube video",
        tags: ["Media"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (req: FastifyRequest<{ Querystring: ProxyQuery }>, reply: FastifyReply) => {
      const { id } = req.query
      const logger = getLogger()

      if (!id) {
        logger.error("Missing required query parameter: id")
        reply.code(400).send({ error: "Missing required query parameter: id" })
        return
      }

      const url = await youtubePlayer.downloadItem(id)
      if (url) {
        const filename = path.join(getConfig("musicCache"), `${id}.m4a`)

        if (!fs.existsSync(filename)) {
          logger.error(`Missing file for ${id} - ${filename}`)
          reply.code(404).send({ error: `File for ${id} not found` })
          return
        }

        const stat = fs.statSync(filename)

        reply
          .header("Content-Type", "audio/mp4") // correct MIME for .m4a
          .header("Content-Length", stat.size)
          .header("Accept-Ranges", "bytes")

        const stream = fs.createReadStream(filename)
        return reply.send(stream)
      }

      logger.error(`Unable to download for id  ${id}`)
      reply.code(404).send({ error: `File for ${id} not found` })
    },
  )
}
