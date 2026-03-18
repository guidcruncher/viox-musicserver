import { BackendMediaResolver } from "./backendMediaResolver"
import { LocalMediaResolver } from "./localMediaResolver"
import { PodverseMediaResolver } from "./podverseMediaResolver"
import { RadioMediaResolver } from "./radioMediaResolver"
import { SpotifyMediaResolver } from "./spotifyMediaResolver"
import { YouTubeMediaResolver } from "./youtubeMediaResolver"

export const BACKEND_MEDIA_RESOLVERS: Record<string, BackendMediaResolver> = {
  youtube: new YouTubeMediaResolver(),
  spotify: new SpotifyMediaResolver(),
  podverse: new PodverseMediaResolver(),
  radio: new RadioMediaResolver(),
  local: new LocalMediaResolver(),
}
