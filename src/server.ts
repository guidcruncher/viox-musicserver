import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import swagger from "@fastify/swagger"
import Fastify from "fastify"

import { getConfig } from "@/config"

import { registerEventBus } from "./events/registerEventBus"
import { getLogger } from "./logger"
import cachePlugin from "./plugins/cacheHook"
import migrationPlugin from "./plugins/youtubeMigrator"
import { registerAllRoutes } from "./routes.generated"
import { MultiLevelCache } from "./services/cache/multiLevelCache"
import { RegisterPodverseIndexer } from "./services/podverse/podverseIndexerDaemon"
import { RegisterPodcastProxyRoute } from "./services/proxy/createPodcastProxyRoute"
import { version } from "./version"

export async function createServer() {
  const logger = getLogger()

  const app = Fastify({
    logger: (getConfig("nodeEnv") || "development").toString() == "development",
  })

  logger.info("Registering event bus")
  await registerEventBus(app)

  if (getConfig("nodeEnv") == "production") {
    logger.info("Registering client UI")
    const distPath = "/app/client/"
    app.register(fastifyStatic, {
      root: distPath,
      prefix: "/", // optional, defaults to '/'
      // Disable caching logic
      cacheControl: false, // Disables the default internal cache-control logic
      setHeaders: (res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        res.setHeader("Pragma", "no-cache")
        res.setHeader("Expires", "0")
        res.setHeader("Surrogate-Control", "no-store")
      },
    })

    app.setNotFoundHandler(function (request, reply) {
      reply.sendFile("index.html")
    })
  }

  await app.register(cors, {})

  logger.info("Registering cache")
  const cache = new MultiLevelCache()

  await app.register(cachePlugin, {
    cacheService: cache,
    routes: [
      {
        prefix: "/api/spotify",
        alwaysOn: false,
      },
    ],
  })

  logger.info("Enabling Swagger/OpenAPI documentation")
  await app.register(swagger, {
    openapi: {
      info: {
        title: "VIOX Music Server",
        description: "The VIOX Music server control API",
        version: version,
      },
      servers: [{ url: `${getConfig("baseUrl")}` }],
    },
  })

  await app.register(import("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
    configuration: {
      theme: "purple",
    },
  })

  /*
  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
    },
  })
*/

  logger.info("Registering youtube migrator")
  await app.register(migrationPlugin)

  logger.info("Registering routes")
  await registerAllRoutes(app)

  //  await mpdService.checkConnection();
  logger.info("Connected to MPD successfully")

  logger.info("Registering Podcast proxy")
  await RegisterPodcastProxyRoute(app)

  logger.info("Registering Podcast indexer")
  await RegisterPodverseIndexer({ runOnStartup: false })
  return app
}
