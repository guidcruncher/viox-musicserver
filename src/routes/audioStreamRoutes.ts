import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import { AudioStreamService } from "@/services/audioService"
import type { VioxBackend } from "@/types"

export function registerAudioStreamRoutes(fastify: FastifyInstance, _backend: VioxBackend) {
  const audioService = AudioStreamService.getInstance()

  fastify.get("/api/stream", async (request: FastifyRequest, reply: FastifyReply) => {
    const stream = audioService.getAudioStream();

    // Standard headers for Ogg/Opus live streaming
    reply.raw.writeHead(200, {
      "Content-Type": "audio/ogg",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache, no-store",
    });

    // Handle network-level backpressure
    const onData = (chunk: Buffer) => {
      const drained = reply.raw.write(chunk);
      if (!drained) {
        stream.pause();
        reply.raw.once("drain", () => stream.resume());
      }
    };

    stream.on("data", onData);

    // Critical: Clean up when the Pi disconnects
    request.raw.on("close", () => {
      stream.removeListener("data", onData);
      stream.destroy();
    });

    // Keeps the request alive
    await reply;
  })
}
