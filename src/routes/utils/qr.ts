import { FastifyInstance } from "fastify"

import { qrService } from "../../services/qr/qrService"

const getSchema = {
  description: "Get a QR code for a url or value",
  tags: ["Utility"],
  querystring: {
    type: "object",
    properties: {
      url: { type: "string" },
    },
    required: ["url"],
  },
  response: {
    200: {
      description: "PNG image of QR code",
      content: {
        "image/png": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  },
}

export async function qr(app: FastifyInstance) {
  app.get("/qr", { schema: getSchema }, async (req: any, reply: any) => {
    const url = (req.query as any).url

    if (!url || typeof url !== "string") {
      return reply.status(400).send({ error: "Missing ?url=" })
    }

    try {
      const png = await qrService.generatePng(url)
      reply.type("image/png")
      return reply.send(png)
    } catch (err: any) {
      return reply.status(500).send({ error: String(err) })
    }
  })
}
