import cors from "@fastify/cors"
import fastifyStatic from "@fastify/static"
import swagger from "@fastify/swagger"
import scalarFastify from "@scalar/fastify-api-reference"
import Fastify from "fastify"

import { config } from "@/config"
import { createVioxBackend } from "@/core/createBackend"
import { registerEventBus } from "@/infra/eventbus/registerEventBus"
import { registerScheduler } from "@/infra/scheduler"
import { logger } from "@/logger"
import { registerAllRoutes } from "@/routes"
import { registerSchemas } from "@/schemas"
import { version } from "@/version"

export const createServer = async () => {
  const app = Fastify({
    logger: config.nodeEnv === "development",
  })

  registerSchemas(app)

  if (config.nodeEnv === "production") {
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

  const allowedOrigin = config.baseUrl
  await app.register(cors, {
    origin: allowedOrigin || false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })

  logger.info("Enabling Swagger/OpenAPI documentation")
  await app.register(swagger, {
    openapi: {
      info: {
        title: "VIOX Music Server",
        description: "The VIOX Music server control API",
        version: version,
      },
      servers: [{ url: config.baseUrl }],
    },
  })

  await app.register(scalarFastify, {
    routePrefix: "/docs",
    configuration: {
      title: "VIOX Music Server API Reference",
    },
  })

  logger.info("Creating backend")
  const backend = createVioxBackend()

  logger.info("Registering scheduler")
  await registerScheduler(backend)

  logger.info("Registering routes")
  await registerAllRoutes(app, backend)

  logger.info("Registering eventbus")
  await registerEventBus(app)
  logger.info("Registered eventbus")

  return app
}
