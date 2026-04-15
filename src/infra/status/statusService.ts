// src/infra/status/statusService.ts
import type { BackendRegistry } from "@/infra/backends/backendRegistry"
import { getStreamMetadata } from "@/infra/networking/getStreamMetadata"
import type { PlaybackController } from "@/infra/playback/playbackController"
import { Capabilities } from "@/types"

import { SqliteLibraryStore } from "../libraryStore"
import { PipewireTopService } from "../playback/pipewireTopUtility"

export class StatusService {
  private readonly pipewireTop = new PipewireTopService()
  constructor(
    private readonly libraryStore: SqliteLibraryStore,
    private readonly registry: BackendRegistry,
    private readonly playback: PlaybackController,
  ) {}

  async get() {
    const current = this.playback.getCurrentItem()
    const backends = this.registry.list()
    const audioState = await this.pipewireTop.getStatus()
    let nowPlaying = undefined
    let audioCaps = undefined

    if (current) {
      audioCaps = Capabilities.audioSources[current.sourceRef.source]
      if (current.sourceRef.uri && audioCaps.metadataCap.includes("live")) {
        nowPlaying = await getStreamMetadata(current.sourceRef.uri)
        if (current.library) {
          this.libraryStore.upsert([current])
        }
      }
    }

    return {
      playing: audioState ? audioState.isOutputtingAudio : false,
      currentItem: current ?? null,
      capabilities: audioCaps,
      nowPlaying,
      backends,
    }
  }
}
