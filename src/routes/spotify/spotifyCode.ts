import axios from "axios"

export async function spotifyCode(app: any) {
  app.get(
    "/spotify/code",
    {
      schema: {
        tags: ["Spotify"],
        query: {
          type: "object",
          required: ["uri"],
          properties: {
            uri: { type: "string" }, // spotify:track:xxx
            background: { type: "string" }, // black, white, etc
            barColor: { type: "string" }, // white, black, etc
            size: { type: "number" }, // 80–640
          },
        },
      },
    },
    async (req: any, reply: any) => {
      const { uri, background = "black", barColor = "white", size = 640 } = req.query

      const encodedUri = encodeURIComponent(uri)

      const url = `https://scannables.scdn.co/uri/plain/${background}/${barColor}/${size}/${encodedUri}`

      const res = await axios.get(url, {
        responseType: "arraybuffer",
      })

      reply.header("Content-Type", "image/png").send(res.data)
    },
  )
}
