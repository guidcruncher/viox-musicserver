import type { FastifyInstance } from "fastify"

import { logger } from "@/logger"
import { ImageCacheService } from "@/services/imageCacheService"
import type { VioxBackend } from "@/types"
import { isSafeExternalUrl } from "@/utils/urlValidator"

export function registerAlbumArtRoutes(app: FastifyInstance, _backend: VioxBackend) {
  logger.info("Registering Album Art routes")
  const cache = new ImageCacheService()

  app.get("/api/image", async (req, res) => {
    const { url } = req.query as { url: string }

    if (!url) {
      return res.code(400).send({ error: "Missing url query parameter" })
    }

    if (!isSafeExternalUrl(url)) {
      return res.code(400).send({ error: "Invalid or disallowed URL" })
    }

    try {
      const { stream, mimeType, originalFilename } = await cache.getImage(url)

      res.header("content-type", mimeType)
      res.header("content-disposition", `inline; filename="${originalFilename}"`)

      return res.send(stream)
    } catch (err) {
      app.log.error(err)
      return res.code(500).send({ error: "Internal error fetching image" })
    }
  })
}
