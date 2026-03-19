import { getConfig } from "@/config"

import { BackendRouter } from "@/core/playback/backendRouter"
import { AudioSourceRegistry } from "@/core/sources/audioSourceRegistry"

// Spotify
import { SpotifySourceAdapter } from "@/infra/sources/spotifyAdapter"
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend"

// Podverse
import { PodverseSourceAdapter } from "@/infra/sources/podverseAdapter"
import { PodversePlaybackBackend } from "@/infra/backends/podverseBackend"

// Radio
import { TuneInSourceAdapter } from "@/infra/sources/tuneinAdapter"
import { RadioBrowserSourceAdapter } from "@/infra/sources/radiobrowserAdapter"
import { RadioPlaybackBackend } from "@/infra/backends/radioBackend"

// Local
import { LocalFileSystemClient } from "@/infra/local/LocalFileSystemClient"
import { LocalSourceAdapter } from "@/infra/sources/localAdapter"
import { LocalPlaybackBackend } from "@/infra/backends/localBackend"

export function createVioxBackend(config: { localRoot: string }) {
  //
  // 1. Source registry
  //
  const sources = new AudioSourceRegistry()

  sources.register("spotify", new SpotifySourceAdapter())
  sources.register("podverse", new PodverseSourceAdapter())
  sources.register("tunein", new TuneInSourceAdapter())
  sources.register("radiobrowser", new RadioBrowserSourceAdapter())

  const localFs = new LocalFileSystemClient(getConfig("musicFolder"))
  sources.register("local", new LocalSourceAdapter(localFs))

  //
  // 2. Playback backends
  //
  const router = new BackendRouter()

  router.register("spotify", new SpotifyPlaybackBackend())
  router.register("podverse", new PodversePlaybackBackend())
  router.register("tunein", new RadioPlaybackBackend())
  router.register("radiobrowser", new RadioPlaybackBackend())
  router.register("local", new LocalPlaybackBackend())

  //
  // 3. Return orchestrated backend
  //
  return {
    sources,
    router,
  }
}
