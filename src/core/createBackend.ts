import { db } from "@/infra/db";

// Stores
import { SqliteLibraryStore } from "@/infra/library-store-sqlite";
import { SqliteQueueStore } from "@/infra/queue-store-sqlite";
import { SqlitePlaylistStore } from "@/infra/playlist-store-sqlite";

// Backends
import { SpotifyPlaybackBackend } from "@/infra/backends/spotify-backend";
import { MPDPlaybackBackend } from "@/infra/backends/mpd-backend";
import { OtherPlaybackBackend } from "@/infra/backends/other-backend";

// Router
import { SimpleBackendRouter } from "@/infra/backend-router";

// Orchestrator
import { DefaultPlaybackOrchestrator } from "@/core/playback-orchestrator";

// Source adapters
import { AudioSourceRegistry } from "@/core/audio-source-registry";
import { SpotifySourceAdapter } from "@/infra/sources/spotify-adapter";
import { PodverseSourceAdapter } from "@/infra/sources/podverse-adapter";
import { RadioBrowserSourceAdapter } from "@/infra/sources/radiobrowser-adapter";
import { TuneInSourceAdapter } from "@/infra/sources/tunein-adapter";
import { YouTubeMusicSourceAdapter } from "@/infra/sources/youtube-adapter";
import { LocalSourceAdapter } from "@/infra/sources/local-adapter";

// Engine
import { DefaultPlaybackEngine } from "@/core/playback-engine";

export function createVioxBackend() {
  //
  // ────────────────────────────────────────────────
  //   Stores (SQLite-backed)
  // ────────────────────────────────────────────────
  //
  const library = new SqliteLibraryStore(db);
  const queue = new SqliteQueueStore(db);
  const playlists = new SqlitePlaylistStore(db, library);

  //
  // ────────────────────────────────────────────────
  //   Playback Backends
  // ────────────────────────────────────────────────
  //
  const spotifyBackend = new SpotifyPlaybackBackend(/* spotifyClient */);
  const mpdBackend = new MPDPlaybackBackend(/* mpdClient */);
  const otherBackend = new OtherPlaybackBackend();

  //
  // ────────────────────────────────────────────────
  //   Backend Router
  // ────────────────────────────────────────────────
  //
  const router = new SimpleBackendRouter(
    spotifyBackend,
    mpdBackend,
    otherBackend
  );

  //
  // ────────────────────────────────────────────────
  //   Audio Source Registry
  // ────────────────────────────────────────────────
  //
  const sources = new AudioSourceRegistry([
    new SpotifySourceAdapter(/* spotifyClient */),
    new PodverseSourceAdapter(/* podverseClient */),
    new RadioBrowserSourceAdapter(/* radioBrowserClient */),
    new TuneInSourceAdapter(/* tuneInClient */),
    new YouTubeMusicSourceAdapter(/* youtubeClient */),
    new LocalSourceAdapter(/* localFileService */),
  ]);

  //
  // ────────────────────────────────────────────────
  //   Playback Orchestrator
  // ────────────────────────────────────────────────
  //
  const orchestrator = new DefaultPlaybackOrchestrator(
    queue,
    library,
    router
  );

  //
  // ────────────────────────────────────────────────
  //   Playback Engine (public façade)
  // ────────────────────────────────────────────────
  //
  const engine = new DefaultPlaybackEngine(
    library,
    queue,
    playlists,
    router,
    orchestrator,
    sources
  );

  //
  // ────────────────────────────────────────────────
  //   Return all components for flexibility
  // ────────────────────────────────────────────────
  //
  return {
    db,
    library,
    queue,
    playlists,
    spotifyBackend,
    mpdBackend,
    otherBackend,
    router,
    sources,
    orchestrator,
    engine,
  };
}
