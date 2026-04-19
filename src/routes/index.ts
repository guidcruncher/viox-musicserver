/* prettier-ignore-file */
/* eslint-disable */
// AUTO-GENERATED FILE — DO NOT EDIT
import { FastifyInstance } from "fastify"
import type { VioxBackend } from "@/types"

import { registerAlbumArtRoutes } from "@/routes/albumArtRoutes"
import { registerArtistRoutes } from "@/routes/artistRoutes"
import { registerBackendStatusRoutes } from "@/routes/backendStatusRoutes"
import { registerCatalogRoutes } from "@/routes/catalogRoutes"
import { registerEqualizerRoutes } from "@/routes/equalizerRoutes"
import { registerImportRoutes } from "@/routes/importRoutes"
import { registerLibraryRoutes } from "@/routes/libraryRoutes"
import { registerLocalRoutes } from "@/routes/localRoutes"
import { registerMediaRoutes } from "@/routes/mediaRoutes"
import { registerMusicBrainzRoutes } from "@/routes/musicBrainzRoutes"
import { registerPlaybackRoutes } from "@/routes/playbackRoutes"
import { registerPodcastRoutes } from "@/routes/podcastRoutes"
import { registerPodverseRoutes } from "@/routes/podverseRoutes"
import { registerQueueRoutes } from "@/routes/queueRoutes"
import { registerRadioPluginRoutes } from "@/routes/radioPluginRoutes"
import { registerRadioRoutes } from "@/routes/radioRoutes"
import { registerSearchRoutes } from "@/routes/searchRoutes"
import { registerSpeakerRoutes } from "@/routes/speakerRoutes"
import { registerSpotifyAuthRoutes } from "@/routes/spotifyAuthRoutes"
import { registerStreamerRoutes } from "@/routes/streamerRoutes"
import { registerSystemRoutes } from "@/routes/systemRoutes"
import { registerVersionRoutes } from "@/routes/versionRoutes"
import { registerVisualizerRoutes } from "@/routes/visualizerRoutes"

export const registerAllRoutes = async (app: FastifyInstance, backend: VioxBackend) => {
  registerAlbumArtRoutes(app, backend)
  registerArtistRoutes(app, backend)
  registerBackendStatusRoutes(app, backend)
  registerCatalogRoutes(app, backend)
  registerEqualizerRoutes(app, backend)
  registerImportRoutes(app, backend)
  registerLibraryRoutes(app, backend)
  registerLocalRoutes(app, backend)
  registerMediaRoutes(app, backend)
  registerMusicBrainzRoutes(app, backend)
  registerPlaybackRoutes(app, backend)
  registerPodcastRoutes(app, backend)
  registerPodverseRoutes(app, backend)
  registerQueueRoutes(app, backend)
  registerRadioPluginRoutes(app, backend)
  registerRadioRoutes(app, backend)
  registerSearchRoutes(app, backend)
  registerSpeakerRoutes(app, backend)
  registerSpotifyAuthRoutes(app, backend)
  registerStreamerRoutes(app, backend)
  registerSystemRoutes(app, backend)
  registerVersionRoutes(app, backend)
  registerVisualizerRoutes(app, backend)
}
