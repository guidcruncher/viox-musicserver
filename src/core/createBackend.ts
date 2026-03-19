import { SimpleBackendRouter } from "@/infra/backendRouter"
import { BackendRegistry } from "@/infra/backends/backendRegistry"
import { LocalPlaybackBackend } from "@/infra/backends/localBackend"
import { PodversePlaybackBackend } from "@/infra/backends/podverseBackend"
import { RadioPlaybackBackend } from "@/infra/backends/radioBackend"
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend"
import { EqualizerService } from "@/infra/equalizer/equalizerService"
import { SqliteLibraryStore } from "@/infra/libraryStore"
import { PlaybackController } from "@/infra/playback/playbackController"
import { SqlitePlaylistStore } from "@/infra/playlistStore"
import { SpeakerControlService } from "@/infra/snapserver/speakerControlService"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import { StatusService } from "@/infra/status/statusService"
import { SpotifyImportService } from "@/services/spotifyImportService"
import type { VioxBackend } from "@/types/vioxBackend"

export function createVioxBackend(): VioxBackend {
  //
  // ────────────────────────────────────────────────
  // 1. Instantiate playback backends
  // ────────────────────────────────────────────────
  //
  const spotifyBackend = new SpotifyPlaybackBackend()
  const localBackend = new LocalPlaybackBackend()
  const radioBackend = new RadioPlaybackBackend()
  const podverseBackend = new PodversePlaybackBackend()

  //
  // ────────────────────────────────────────────────
  // 2. Backend registry (lookup table)
  // ────────────────────────────────────────────────
  //
  const backendRegistry = new BackendRegistry({
    spotify: spotifyBackend,
    local: localBackend,
    tunein: radioBackend,
    radiobrowser: radioBackend,
    podverse: podverseBackend,
  })

  //
  // ────────────────────────────────────────────────
  // 3. Backend router (sourceRef → backend)
  // ────────────────────────────────────────────────
  //
  const backendRouter = new SimpleBackendRouter(
    backendRegistry.backends,
    localBackend, // fallback
  )

  //
  // ────────────────────────────────────────────────
  // 4. Playback controller (unifies all backends)
  // ────────────────────────────────────────────────
  //
  const playback = new PlaybackController(backendRouter)

  //
  // ────────────────────────────────────────────────
  // 5. Library + playlist stores
  // ────────────────────────────────────────────────
  //
  const library = new SqliteLibraryStore()
  const playlists = new SqlitePlaylistStore(library)

  //
  // ────────────────────────────────────────────────
  // 7. Equalizer + Speakers + Status
  // ────────────────────────────────────────────────
  //
  const equalizer = new EqualizerService()
  const speakers = new SpeakerControlService()
  const status = new StatusService(backendRegistry, playback)

  //
  // ────────────────────────────────────────────────
  // 8. Importers (Spotify + Local)
  // ────────────────────────────────────────────────
  //
  const importers = {
    spotify: new SpotifyImportService(new SpotifyWebClient(), library, playlists),
  }

  //
  // ────────────────────────────────────────────────
  // 9. Return unified backend
  // ────────────────────────────────────────────────
  //
  return {
    playback,
    library,
    playlists,
    equalizer,
    backends: backendRegistry,
    speakers,
    status,
    importers,
  }
}
