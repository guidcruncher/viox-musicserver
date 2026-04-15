// src/infra/backends/backendRegistry.ts
import { LocalPlaybackBackend } from "@/infra/backends/localBackend"
import { PodversePlaybackBackend } from "@/infra/backends/podverseBackend"
import { RadioPlaybackBackend } from "@/infra/backends/radioBackend"
import { SpotifyPlaybackBackend } from "@/infra/backends/spotifyBackend"
import type { PlaybackBackend } from "@/types"

export class BackendRegistry {
  public readonly backends: Record<string, PlaybackBackend>

  constructor(backends: Record<string, PlaybackBackend>) {
    this.backends = backends
  }

  get(name: string): PlaybackBackend | undefined {
    return this.backends[name]
  }

  list(): { name: string }[] {
    return Object.keys(this.backends).map((name) => ({ name }))
  }
}

const spotifyBackend = new SpotifyPlaybackBackend()
const localBackend = new LocalPlaybackBackend()
const radioBackend = new RadioPlaybackBackend()
const podverseBackend = new PodversePlaybackBackend()

export const backendRegistry = new BackendRegistry({
  spotify: spotifyBackend,
  local: localBackend,
  tunein: radioBackend,
  radiobrowser: radioBackend,
  podverse: podverseBackend,
  stream: radioBackend,
})
