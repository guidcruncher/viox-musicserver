import { config } from "@/config"
import { LocalFileSystemClient } from "@/infra/local/localFileSystemClient"
import { SqliteRadioStore } from "@/infra/radioStore"
import { LocalSourceAdapter } from "@/infra/sources/localAdapter"
import { PodverseSourceAdapter } from "@/infra/sources/podverseAdapter"
import { RadioBrowserSourceAdapter } from "@/infra/sources/radioBrowserAdapter"
import { SpotifySourceAdapter } from "@/infra/sources/spotifyAdapter"
import { StreamAdapter } from "@/infra/sources/streamAdapter"
import { TuneInSourceAdapter } from "@/infra/sources/tuneInAdapter"
import { logger } from "@/logger"
import type { AudioSourceAdapter } from "@/types"
import type { AudioSource } from "@/types"
import { SourceRegistry } from "@/types"

class AudioSourceRegistry implements SourceRegistry {
  public readonly sources: Record<AudioSource, AudioSourceAdapter>

  constructor(sources: Record<AudioSource, AudioSourceAdapter>) {
    this.sources = sources
  }

  get(name: AudioSource): AudioSourceAdapter | undefined {
    logger.debug(`Getting AudioSourceAdapter "${name}"`)
    return this.sources[name]
  }

  list(): { name: string }[] {
    return Object.keys(this.sources).map((name) => ({ name }))
  }
}

const spotifySource = new SpotifySourceAdapter()
const tuneInSource = new TuneInSourceAdapter()
const radioBrowserSource = new RadioBrowserSourceAdapter()
const podVerseSource = new PodverseSourceAdapter()
const localSource = new LocalSourceAdapter(new LocalFileSystemClient(config.musicFolder))
const streamSource = new StreamAdapter(new SqliteRadioStore())

export const sourceRegistry = new AudioSourceRegistry({
  spotify: spotifySource,
  local: localSource,
  tunein: tuneInSource,
  radiobrowser: radioBrowserSource,
  podverse: podVerseSource,
  stream: streamSource,
})
