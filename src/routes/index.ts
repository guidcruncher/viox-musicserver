/* prettier-ignore-file */
/* eslint-disable */
// AUTO-GENERATED FILE — DO NOT EDIT
import { FastifyInstance } from "fastify";
import type { VioxBackend } from "@/types";

import { backendStatusRoutes as route0 } from "./routes/backendStatusRoutes";
import { equalizerRoutes as route1 } from "./routes/equalizerRoutes";
import { importRoutes as route2 } from "./routes/importRoutes";
import { libraryRoutes as route3 } from "./routes/libraryRoutes";
import { playbackRoutes as route4 } from "./routes/playbackRoutes";
import { searchRoutes as route5 } from "./routes/searchRoutes";
import { speakerRoutes as route6 } from "./routes/speakerRoutes";


export const registerAllRoutes = async(app: FastifyInstance, backend: VioxBackend) => {
  await app.register(route0, backend);
  await app.register(route1, backend);
  await app.register(route2, backend);
  await app.register(route3, backend);
  await app.register(route4, backend);
  await app.register(route5, backend);
  await app.register(route6, backend);
}
