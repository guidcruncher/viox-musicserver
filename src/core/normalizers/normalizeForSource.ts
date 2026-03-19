import type { AudioSource, MediaItem, MediaItemNormalizer } from "@/types"

import { LocalFileNormalizer } from "./localNormalizer"
import { PodverseNormalizer } from "./podverseNormalizer"
import { RadioBrowserNormalizer } from "./radioBrowserNormalizer"
import { SpotifyNormalizer } from "./spotifyNormalizer"
import { TuneInNormalizer } from "./tuneInNormalizer"

export class NormalizerRegistry {
  private readonly map = new Map<AudioSource, MediaItemNormalizer>()

  constructor() {
    this.map.set("spotify", new SpotifyNormalizer())
    this.map.set("podverse", new PodverseNormalizer())
    this.map.set("radiobrowser", new RadioBrowserNormalizer())
    this.map.set("tunein", new TuneInNormalizer())
    this.map.set("local", new LocalFileNormalizer())
  }

  normalize(source: AudioSource, raw: any): MediaItem {
    const normalizer = this.map.get(source)
    if (!normalizer) {
      throw new Error(`No normalizer registered for source: ${source}`)
    }
    return normalizer.normalize(raw)
  }
}
