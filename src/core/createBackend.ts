import { db } from "@/infra/db";

// Stores
import { SqliteLibraryStore } from "@/infra/libraryStore";
import { SqliteQueueStore } from "@/infra/queueStore";
import { SqlitePlaylistStore } from "@/infra/playlistStore";

// Backends
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend";
import { MPDPlaybackBackend } from "@/infra/backends/mpdBackend";
import { OtherPlaybackBackend } from "@/infra/backends/otherBackend";
import { PipewireFfmpegBackend } from "@/infra/backends/pipewireFfmpegBackend";

// Router
import { SimpleBackendRouter } from "@/infra/backendRouter";

// Orchestrator
import { DefaultPlaybackOrchestrator } from "@/core/playbackOrchestrator";

// Source adapters
import { AudioSourceRegistry } from "@/core/audioSourceRegistry";
import { SpotifySourceAdapter } from "@/infra/sources/spotifyAdapter";
import { PodverseSourceAdapter } from "@/infra/sources/podverseAdapter";
import { RadioBrowserSourceAdapter } from "@/infra/sources/radiobrowserAdapter";
import { TuneInSourceAdapter } from "@/infra/sources/tuneinAdapter";
import { YouTubeMusicSourceAdapter } from "@/infra/sources/youtubeAdapter";
import { LocalSourceAdapter } from "@/infra/sources/local-adapter";

// Engine
import { DefaultPlaybackEngine } from "@/core/playbackEngine";

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
  // const otherBackend = new OtherPlaybackBackend();
  const otherBackend = new PipewireFfmpegBackend({
    ffmpegPath: "ffmpeg",
    pwCatPath: "pw-cat",
    // device: "alsa_output.pci-0000_00_1f.3.analog-stereo", // optional
  });

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

export const backend = createVioxBackend()
