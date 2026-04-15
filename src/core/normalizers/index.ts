import { AudioSource, MediaItemNormalizer } from "@/types"

import { PodverseNormalizer } from "./podverseNormalizer"
import { RadioBrowserNormalizer } from "./radioBrowserNormalizer"
import { SpotifyNormalizer } from "./spotifyNormalizer"
import { TuneInNormalizer } from "./tuneInNormalizer"

export const getNormalizerFromSource = (
  source: AudioSource | string,
): MediaItemNormalizer | undefined => {
  switch (source) {
    case "spotify":
      return new SpotifyNormalizer()
    case "podverse":
      return new PodverseNormalizer()
    case "radiobrowser":
      return new RadioBrowserNormalizer()
    case "tunein":
      return new TuneInNormalizer()
  }
  return undefined
}
