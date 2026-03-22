import type { AudioSourceAdapter } from "@/types"

export class SourceRegistry {
  public readonly sources: Record<string, AudioSourceAdapter>

  constructor(sources: Record<string, AudioSourceAdapter>) {
    this.sources = sources
  }

  get(name: string): AudioSourceAdapter | undefined {
    return this.sources[name]
  }

  list(): { name: string }[] {
    return Object.keys(this.sources).map((name) => ({ name }))
  }
}
