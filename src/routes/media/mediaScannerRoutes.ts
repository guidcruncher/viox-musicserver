import { Type } from "@sinclair/typebox"
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { parseFile } from "music-metadata"

import { MediaItemSchema } from "../../schemas"
import { mediaScannerService } from "../../services/medialibrary/mediaScannerService"

export async function mediaScannerRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/local/img/:id",
    {
      schema: {
        description: "Get icon image from local music file",
        tags: ["Media"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const args = (req.params as any).id.split(":")
      let filename

      if (args.length != 3) {
        filename = Buffer.from((req.params as any).id, "base64").toString("utf8")
      } else {
        filename = Buffer.from(args[2], "base64").toString("utf8")
      }

      const metadata = await parseFile(filename)

      const pic = metadata.common.picture?.[0]
      if (!pic) {
        return reply.code(404).send({ error: "No embedded artwork found" })
      }

      reply.type(pic.format).header("Content-Length", pic.data.length).send(pic.data)
    },
  )

  // --- GET /local/scan ---
  fastify.get(
    "/local/scan",
    {
      schema: {
        description: "Scan a directory for audio files and folders",
        tags: ["Media"],
        querystring: Type.Object({
          dir: Type.Optional(Type.String({ description: "Directory to scan" })),
        }),
        response: {
          200: { type: "array", items: MediaItemSchema },
        },
      },
    },
    async () => {
      const results = await mediaScannerService.scanFolder()

      return results
    },
  )

  // --- GET /local/folder ---
  fastify.get(
    "/local/folder",
    {
      schema: {
        description: "List only the contents of a single folder (non-recursive)",
        tags: ["Media"],
        querystring: Type.Object({
          dir: Type.Optional(Type.String({ description: "Directory to scan" })),
        }),
        response: {
          200: { type: "array", items: MediaItemSchema },
        },
      },
    },
    async () => {
      const results = await mediaScannerService.scanFolder()

      return results
    },
  )
}
