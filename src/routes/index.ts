/* prettier-ignore-file */
/* eslint-disable */
// AUTO-GENERATED FILE — DO NOT EDIT
import { FastifyInstance } from "fastify";
import type { VioxBackend } from "@/types";

import { registerBackendStatusRoutes } from "@/routes/backendStatusRoutes";
import { registerEqualizerRoutes } from "@/routes/equalizerRoutes";
import { registerImportRoutes } from "@/routes/importRoutes";
import { registerLibraryRoutes } from "@/routes/libraryRoutes";
import { registerPlaybackRoutes } from "@/routes/playbackRoutes";
import { registerSpeakerRoutes } from "@/routes/speakerRoutes";
import { registerSpotifyAuthRoutes } from "@/routes/spotifyAuthRoutes";


export const registerAllRoutes = async(app: FastifyInstance, backend: VioxBackend) => {
  registerBackendStatusRoutes(app, backend);
  registerEqualizerRoutes(app, backend);
  registerImportRoutes(app, backend);
  registerLibraryRoutes(app, backend);
  registerPlaybackRoutes(app, backend);
  registerSpeakerRoutes(app, backend);
  registerSpotifyAuthRoutes(app, backend);
}
