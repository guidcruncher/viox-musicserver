import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import swagger from "@fastify/swagger"
import Fastify from "fastify"

import { getConfig } from "@/config"
import { createVioxBackend } from "@/core/createBackend"
import { registerEventBus } from "@/infra/eventbus/registerEventBus"
import { getLogger } from "@/logger"
import { registerAllRoutes } from "@/routes"
import { version } from "@/version"
import { registerSchemas } from "@/schemas"

export const createServer = async () => {
  const logger = getLogger()

  const app = Fastify({
    logger: (getConfig("nodeEnv") || "development").toString() == "development",
  })

  registerSchemas(app)
  registerEventBus(app)

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

    app.setNotFoundHandler((request, reply) => {
      reply.sendFile("index.html")
    })
  }

  await app.register(cors, {})

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

  logger.info("Creating backend")
  const backend = createVioxBackend()

  logger.info("Registering routes")
  await registerAllRoutes(app, backend)

  return app
}
