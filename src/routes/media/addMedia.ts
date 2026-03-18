// src/routes/media/addMedia.ts
import { presetRepository } from "../../repositories/presetRepository"
import { MediaItem } from "../../types/media-types"

export async function addMedia(app: any) {
  app.post(
    "/media/presets",
    {
      schema: {
        tags: ["Media"],
        body: {
          type: "object",
          required: ["id", "title", "subtitle", "type", "uri"],
          properties: {
            id: { type: "string" },
            parent: { type: "string" },
            title: { type: "string" },
            subtitle: { type: "string" },
            img: { type: "string" },
            artist: { type: "string" },
            type: {
              type: "string",
              enum: [
                "spotify",
                "radio",
                "local",
                "podcast",
                "artist",
                "album",
                "playlist",
                "episode",
              ],
            },
            uri: { type: "string" },
            format: { type: "string" },
            isFolder: { type: "boolean" },
            country: { type: "string" },
            bitrate: { type: "string" },
            duration: { type: "number" },
            favourite: { type: "boolean" },
          },
          additionalProperties: true,
        },
        response: {
          200: {
            type: "object",
            required: ["ok"],
            properties: {
              ok: { type: "boolean", const: true },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const item = req.body as MediaItem
      presetRepository.create(item)
      return reply.send({ ok: true })
    },
  )
}
