// src/routes/audio/audioState.ts

import { FastifyInstance } from "fastify"

import { audioControl } from "../../services/audio/audioControl"

const schema = {
  description: "playback state",
  tags: ["Audio"],
  response: {
    200: {
      $id: "AudioStatusFull",
      type: "object",
      properties: {
        active: {
          type: "string",
          enum: ["spotify", "mpd"],
          nullable: true,
        },
        playing: { type: "boolean" },
        currentTrack: {
          anyOf: [
            { type: "null" },
            {
              type: "object",
              properties: {
                id: { type: "string" },
                parent: { type: "string", nullable: true },
                title: { type: "string" },
                subtitle: { type: "string" },
                img: { type: "string", nullable: true },
                artist: { type: "string", nullable: true },
                type: { type: "string" },
                uri: { type: "string" },
                format: { type: "string", nullable: true },
                isFolder: { type: "boolean", nullable: true },
                country: { type: "string", nullable: true },
                bitrate: { type: "string", nullable: true },
                favourite: { type: "boolean", nullable: true },
              },
              required: ["id", "title", "subtitle", "type", "uri"],
            },
          ],
        },
      },
    },
  },
}

export async function audioState(app: FastifyInstance) {
  app.get("/state", { schema }, async (_req: any, reply: any) => {
    const status = await audioControl.status()
    reply.send(status)
  })
}
