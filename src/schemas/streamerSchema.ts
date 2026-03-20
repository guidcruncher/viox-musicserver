export const streamSchema = {
  summary: "Smart Live Audio Stream",
  tags: ["Media"],
  querystring: {
    type: "object",
    properties: {
      format: { type: "string", enum: ["aac", "mp3", "mp4", "raw"] },
    },
  },
}
