import type { BackendRegistry } from "@/infra/backends/backendRegistry"
import type { EqualizerService } from "@/infra/equalizer/equalizerService"
import type { Importers } from "@/infra/importers/types"
import type { LibraryStore } from "@/infra/library/libraryStore"
import type { PlaylistStore } from "@/infra/library/playlistStore"
import type { PlaybackController } from "@/infra/playback/playbackController"
import type { SearchService } from "@/infra/search/searchService"
import type { SpeakerService } from "@/infra/speakers/speakerService"
import type { StatusService } from "@/infra/status/statusService"

export interface VioxBackend {
  playback: PlaybackController
  library: LibraryStore
  playlists: PlaylistStore
  search: SearchService
  equalizer: EqualizerService
  backends: BackendRegistry
  speakers: SpeakerService
  status: StatusService
  importers: Importers
}
