import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"
import { mediaItemResolver } from "../../services/audio/mediaItemResolver"
import { MediaItem } from "../../types/media-types"

const schema = {
  description: "play endpoint for Spotify or MPD",
  tags: ["Audio"],
  params: {
    type: "object",
    properties: {
      type: { type: "string" },
    },
    required: ["type"],
  },
  querystring: {
    type: "object",
    properties: {
      podcastId: { type: "string" },
      subtype: { type: "string" },
    },
  },
  body: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: { status: { type: "string" } },
    },
  },
}

export async function audioPlay(app: FastifyInstance) {
  app.post("/play/:type", { schema }, async (req: any, reply: any) => {
    let item = req.body as any

    if (!item.title && !item.type) {
      item = await mediaItemResolver.getMediaItem(item.id, {
        podcastId: req.query.podcastId,
        subtype: req.query.subtype,
      })
    } else {
      if (item.id.includes("youtube")) {
        item = await mediaItemResolver.patchPlaybackUrl(item)
      }
    }

    if (!item) {
      reply.status(404).send({ status: "error", message: "Item not found" })
      return
    }

    await audioControl.play(item)
    reply.send({ status: "ok", item: item as MediaItem })
  })
}
