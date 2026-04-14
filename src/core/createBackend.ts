import { SpotifyArtistService } from "@/infra/artist/spotifyArtistService"
import { SimpleBackendRouter } from "@/infra/backendRouter"
import { backendRegistry } from "@/infra/backends/backendRegistry"
import { SqliteCacheStore } from "@/infra/cacheStore"
import { EqualizerService } from "@/infra/equalizer/equalizerService"
import { PipewireReverbService } from "@/infra/equalizer/reverbService"
import { SqliteHouseKeepingStore } from "@/infra/houseKeepingStore"
import { SqliteLibraryStore } from "@/infra/libraryStore"
import { MusicBrainzClient } from "@/infra/musicbrainz/musicBrainzClient"
import { SqliteMusicBrainzStore } from "@/infra/musicBrainzStore"
import { PlaybackController } from "@/infra/playback/playbackController"
import { GlobalQueue } from "@/infra/playback/playbackQueue"
import { SqlitePlaylistStore } from "@/infra/playlistStore"
import { PodcastIndexer } from "@/infra/podcast/podcastIndexer"
import { SqliteQueueStore } from "@/infra/queueStore"
import { SqliteRadioStore } from "@/infra/radioStore"
import { Housekeeping } from "@/infra/scheduler/houseKeeping"
import { SqlitePlaybackSessionStore } from "@/infra/sessionStore"
import { SpeakerControlService } from "@/infra/snapserver/speakerControlService"
import { sourceRegistry } from "@/infra/sources/sourceRegistry"
import { SpotifyWebClient } from "@/infra/spotify/spotifyWebClient"
import { StatusService } from "@/infra/status/statusService"
import { SqliteSubscriptionEpisodesStore } from "@/infra/subscriptionEpisodesStore"
import { SqliteSubscriptionsStore } from "@/infra/subscriptionsStore"
import { SqliteTrackStore } from "@/infra/trackStore"
import { SpotifyImportService } from "@/services/spotifyImportService"
import type { VioxBackend } from "@/types/vioxBackend"

export function createVioxBackend(): VioxBackend {
  //
  // ────────────────────────────────────────────────
  // 4. Library + playlist stores
  // ────────────────────────────────────────────────
  //
  const housekeeping = new SqliteHouseKeepingStore()
  const episodes = new SqliteSubscriptionEpisodesStore()
  const subscriptions = new SqliteSubscriptionsStore()
  const trackStore = new SqliteTrackStore()
  const queueStore = new SqliteQueueStore()
  const session = new SqlitePlaybackSessionStore()
  const library = new SqliteLibraryStore()
  const cache = new SqliteCacheStore()
  const playlists = new SqlitePlaylistStore(library)
  const radio = new SqliteRadioStore()
  const musicBrainz = new SqliteMusicBrainzStore()

  const musicBrainzClient = new MusicBrainzClient(musicBrainz)

  //
  // ────────────────────────────────────────────────
  // 3. Backend router (sourceRef → backend)
  // ────────────────────────────────────────────────
  //
  const backendRouter = new SimpleBackendRouter(backendRegistry.backends)

  //
  // ────────────────────────────────────────────────
  // 5. Playback controller (unifies all backends)
  // ────────────────────────────────────────────────
  //
  const podcastIndexer = new PodcastIndexer(subscriptions, episodes)
  const queue = new GlobalQueue(queueStore)
  const playback = new PlaybackController(
    queue,
    {
      cache: cache,
      library: library,
      playlist: playlists,
      radio: radio,
      tracks: trackStore,
    },
    backendRouter,
    session,
  )

  //
  // ────────────────────────────────────────────────
  // 7. Equalizer + Speakers + Status
  // ────────────────────────────────────────────────
  //
  const reverb = new PipewireReverbService()
  const equalizer = new EqualizerService()
  const speakers = new SpeakerControlService()
  const status = new StatusService(backendRegistry, playback)

  //
  // ────────────────────────────────────────────────
  // 8. Importers (Spotify + Local)
  // ────────────────────────────────────────────────
  //
  const importers = {
    spotify: new SpotifyImportService(new SpotifyWebClient(), library, playlists, trackStore),
  }

  const artist = new SpotifyArtistService()

  //
  // ────────────────────────────────────────────────
  // 9. Return unified backend
  // ────────────────────────────────────────────────
  //
  return {
    podcastIndexer,
    queue: queueStore,
    playback,
    library,
    track: trackStore,
    radio,
    cache,
    playlists,
    reverb,
    equalizer,
    backends: backendRegistry,
    speakers,
    status,
    importers,
    sources: sourceRegistry,
    musicBrainzClient,
    musicBrainz,
    artist,
    housekeeping: new Housekeeping(housekeeping),
  }
}
