import type { AudioSourceAdapter } from "@/types"
import type { AudioSource } from "@/types"

export interface SourceRegistry {
  readonly sources: Record<AudioSource, AudioSourceAdapter>

  get(name: AudioSource): AudioSourceAdapter | undefined
  list(): { name: string }[]
}
