import { MpvClient } from "./infra/backends/mpvClient"
import { createServer } from "./server"

if (require.main === module) {
  createServer()
    .then((app) => app.listen({ port: 8080, host: "0.0.0.0" }))
    .catch((err) => {
      MpvClient.restart()
      console.error(err)
      process.exit(1)
    })
}
