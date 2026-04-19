import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { AudioStreamService } from "@/services/audioService"
import type { VioxBackend } from "@/types"

export function registerAudioStreamRoutes(fastify: FastifyInstance, _backend: VioxBackend) {
  const audioService = AudioStreamService.getInstance()

  fastify.get("/api/stream.raw", async (request: FastifyRequest, reply: FastifyReply) => {
    const audioStream = audioService.getAudioStream()

    // Set appropriate headers for raw PCM audio
    reply.raw.writeHead(200, {
      "Content-Type": "audio/l16;rate=48000;channels=2",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    })

    /**
     * Handle Client Disconnect
     * If the user closes the tab or stops the stream, we must destroy
     * the local stream to trigger the AudioService cleanup logic.
     */
    request.raw.on("close", () => {
      if (!audioStream.destroyed) {
        audioStream.destroy()
      }
    })

    // Return the stream directly to Fastify
    return audioStream
  })
}
