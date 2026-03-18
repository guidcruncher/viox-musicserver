import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { createReadStream, createWriteStream, existsSync } from "fs"
import { mkdir, stat } from "fs/promises"
import { join } from "path"
import { request as undiciRequest } from "undici"

import { getConfig } from "@/config"

import { getLogger } from "../../logger"

interface ProxyQuery {
  id: string
  url: string
}

export async function RegisterPodcastProxyRoute(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: ProxyQuery
  }>(
    "/api/proxy/podcast",
    {
      schema: {
        tags: ["Podverse"],
        description: "Proxies files from Podverse Pdodcasts",
      },
    },
    async (req: FastifyRequest<{ Querystring: ProxyQuery }>, reply: FastifyReply) => {
      const { id, url } = req.query

      if (!url) {
        reply.code(400).send({ error: "Missing required query parameter: url" })
        return
      }

      try {
        const resolved = await resolveRedirect(url)

        const localPath = await downloadEpisode(id, resolved)
        return streamLocalFile(localPath, reply)
      } catch (err) {
        reply.code(500).send({ error: "Proxy error", detail: (err as Error).message })
      }
    },
  )
}

/**
 * Resolve redirects manually.
 */
async function resolveRedirect(initialUrl: string): Promise<string> {
  let current = initialUrl
  const logger = getLogger()
  logger.debug(`Resolving url for ${initialUrl}`)

  for (let i = 0; i < 5; i++) {
    const res = await undiciRequest(current, { method: "HEAD" })

    const status = res.statusCode
    if (status >= 300 && status < 400) {
      const loc = res.headers.location
      if (!loc) break

      current = Array.isArray(loc) ? loc[0] : loc
      continue
    }

    return current
  }

  return current
}

/**
 * Download the episode locally and return the file path.
 */
async function downloadEpisode(id: string, url: string): Promise<string> {
  const logger = getLogger()

  if (!existsSync(getConfig("podcastCache"))) {
    await mkdir(getConfig("podcastCache"), { recursive: true })
  }

  // const filename = url.split("/").pop()?.split("?")[0] ?? `episode-${Date.now()}.mp3`
  const filename = `${id}.mp3`
  const localPath = join(getConfig("podcastCache"), filename)
  logger.debug(`Downloading ${url} to ${filename}`)
  // If already downloaded, reuse it
  try {
    await stat(localPath)
    logger.debug(`Already exists aborting download ${filename}`)
    return localPath
  } catch {
    // file does not exist, continue
  }

  const res = await undiciRequest(url, { method: "GET" })

  if (res.statusCode >= 400) {
    logger.error(`Downloading ${url} failed error ${res.statusCode}`)
    throw new Error(`Failed to download: ${res.statusCode}`)
  }

  const fileStream = createWriteStream(localPath)

  await new Promise<void>((resolve, reject) => {
    res.body.pipe(fileStream)
    res.body.on("error", reject)
    fileStream.on("finish", resolve)
    fileStream.on("error", reject)
  })

  return localPath
}

/**
 * Stream a local file to MPD.
 */
function streamLocalFile(path: string, reply: FastifyReply) {
  reply
    .header("Content-Type", "audio/mpeg")
    .header("Cache-Control", "no-cache")
    .header("Connection", "keep-alive")

  const stream = createReadStream(path)
  stream.pipe(reply.raw)

  return reply
}
