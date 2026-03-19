import type { SpeakerControlService } from "@/infra//snapserver/speakerControlService"
import type { BackendRegistry } from "@/infra/backends/backendRegistry"
import type { EqualizerService } from "@/infra/equalizer/equalizerService"
import type { PlaybackController } from "@/infra/playback/playbackController"
import type { SearchService } from "@/infra/search/searchService"
import type { StatusService } from "@/infra/status/statusService"
import { Importers } from "@/types"
import type { LibraryStore } from "@/types/libraryStore"
import type { PlaylistStore } from "@/types/playlistStore"

export interface VioxBackend {
  playback: PlaybackController
  library: LibraryStore
  playlists: PlaylistStore
  search: SearchService
  equalizer: EqualizerService
  backends: BackendRegistry
  speakers: SpeakerControlService
  status: StatusService
  importers: Importers
}
