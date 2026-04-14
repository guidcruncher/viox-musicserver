import type { SpeakerControlService } from "@/infra/snapserver/speakerControlService"
import type { ArtistSource } from "@/infra/artist/types/artist"
import type { BackendRegistry } from "@/infra/backends/backendRegistry"
import type { EqualizerService } from "@/infra/equalizer/equalizerService"
import type { PipewireReverbService } from "@/infra/equalizer/reverbService"
import type { MusicBrainzClient } from "@/infra/musicbrainz/musicBrainzClient"
import type { PlaybackController } from "@/infra/playback/playbackController"
import type { PodcastIndexer } from "@/infra/podcast/podcastIndexer"
import type { Housekeeping } from "@/infra/scheduler/houseKeeping"
import type { StatusService } from "@/infra/status/statusService"
import type { SourceRegistry, TrackStore } from "@/types"
import type { Importers, QueueStore } from "@/types"
import type { CacheItemStore } from "@/types/cacheItemStore"
import type { LibraryStore } from "@/types/libraryStore"
import type { MediaItemStore } from "@/types/mediaItemStore"
import type { MusicBrainzStore } from "@/types/musicBrainzStore"
import type { PlaylistStore } from "@/types/playlistStore"

export interface VioxBackend {
  housekeeping: Housekeeping
  podcastIndexer: PodcastIndexer
  queue: QueueStore
  radio: MediaItemStore
  playback: PlaybackController
  library: LibraryStore
  track: TrackStore
  cache: CacheItemStore
  musicBrainz: MusicBrainzStore
  playlists: PlaylistStore
  equalizer: EqualizerService
  reverb: PipewireReverbService
  backends: BackendRegistry
  speakers: SpeakerControlService
  status: StatusService
  importers: Importers
  sources: SourceRegistry
  musicBrainzClient: MusicBrainzClient
  artist: ArtistSource
}
