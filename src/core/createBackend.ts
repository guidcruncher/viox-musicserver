import { audioSourceRegistry } from "@/core/audioSourceRegistry"
import { SimpleBackendRouter } from "@/infra/backendRouter"
import { LocalPlaybackBackend } from "@/infra/backends/localBackend"
import { PodversePlaybackBackend } from "@/infra/backends/podverseBackend"
import { RadioPlaybackBackend } from "@/infra/backends/radioBackend"
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend"

export const createVioxBackend = () => {
  //
  // 1. Source registry
  //
  const sources = audioSourceRegistry()

  //
  // 2. Playback backends
  //
  const router = new SimpleBackendRouter(
    {
      spotify: new SpotifyPlaybackBackend(),
      podverse: new PodversePlaybackBackend(),
      tunein: new RadioPlaybackBackend(),
      radiobrowser: new RadioPlaybackBackend(),
      local: new LocalPlaybackBackend(),
    },
    new LocalPlaybackBackend(), // fallback backend
  )
  //
  // 3. Return orchestrated backend
  //
  return {
    sources,
    router,
  }
}
