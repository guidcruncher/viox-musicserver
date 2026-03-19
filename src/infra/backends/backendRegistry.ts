// src/infra/backends/backendRegistry.ts
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
