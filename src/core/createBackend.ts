import { getConfig } from "@/config"
import { BackendRouter } from "@/core/playback/backendRouter"
import { AudioSourceRegistry } from "@/core/sources/audioSourceRegistry"
import { LocalPlaybackBackend } from "@/infra/backends/localBackend"
import { PodversePlaybackBackend } from "@/infra/backends/podverseBackend"
import { RadioPlaybackBackend } from "@/infra/backends/radioBackend"
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend"
// Local
import { LocalFileSystemClient } from "@/infra/local/LocalFileSystemClient"
import { LocalSourceAdapter } from "@/infra/sources/localAdapter"
// Podverse
import { PodverseSourceAdapter } from "@/infra/sources/podverseAdapter"
import { RadioBrowserSourceAdapter } from "@/infra/sources/radiobrowserAdapter"
// Spotify
import { SpotifySourceAdapter } from "@/infra/sources/spotifyAdapter"
// Radio
import { TuneInSourceAdapter } from "@/infra/sources/tuneinAdapter"

export const createVioxBackend = () => {
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
