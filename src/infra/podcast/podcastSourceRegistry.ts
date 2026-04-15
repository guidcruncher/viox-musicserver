import { AudioSource, PodcastSourceAdapter } from "@/types"

import { PodversePodcastSourceAdapter } from "./podversePodcastSourceAdapter"
import { SpotifyPodcastSourceAdapter } from "./spotifyPodcastSourceAdapter"

export const podcastSourceRegistry = (source: AudioSource): PodcastSourceAdapter | undefined => {
  switch (source) {
    case "spotify":
      return new SpotifyPodcastSourceAdapter()
    case "podverse":
      return new PodversePodcastSourceAdapter()
  }

  return undefined
}
