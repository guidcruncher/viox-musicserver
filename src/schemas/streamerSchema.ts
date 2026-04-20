import { AudioStreamService } from "@/services/audioService"

export const StreamerSchema = {
  summary: "Smart Live Audio Stream",
  tags: ["Media"],
  querystring: {
    type: "object",
    properties: {
      format: { type: "string", enum: AudioStreamService.getAudioFormatsSupported() },
    },
  },
}
