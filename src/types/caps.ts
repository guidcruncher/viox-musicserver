import { AudioSource } from "./audioSource"
import { AudioSourceItemType } from "./audioSourceItemType"

export type PlaybackCap = "playable" | "seekable" | "pausable" | "resumable" | "live"

export type MetaDataCap = "artwork" | "musicbrainz" | "live"

export interface AudioSourceCap {
  name: string
  group: string
  itemTypes: AudioSourceItemType[]
  playbackCap: PlaybackCap[]
  metadataCap: MetaDataCap[]
  initialBrowseSourceId?: string
  browsable: boolean
  searchable: boolean
}

interface LibraryFilter {
  name: string
  itemTypes: AudioSourceItemType | AudioSourceItemType[]
}

interface Caps {
  audioSources: Record<AudioSource, AudioSourceCap>
  libraryFilters: LibraryFilter[]
  playable: AudioSourceItemType[]
}

export const Capabilities: Caps = {
  libraryFilters: [
    { name: "All", itemTypes: [] },
    { name: "Playlists", itemTypes: ["playlist"] },
    { name: "Albums", itemTypes: ["album"] },
    { name: "Tracks", itemTypes: ["track"] },
    { name: "Podcasts", itemTypes: ["show", "podcast"] },
    { name: "Radio", itemTypes: ["station"] },
    { name: "Files", itemTypes: ["folder", "track"] },
  ],
  audioSources: {
    spotify: {
      name: "Spotify",
      group: "music",
      itemTypes: ["playlist", "show", "episode", "track", "album"],
      playbackCap: ["playable", "seekable", "pausable", "resumable"],
      metadataCap: ["artwork", "musicbrainz"],
      browsable: true,
      searchable: true,
    },
    podverse: {
      name: "Podverse",
      group: "podcast",
      itemTypes: ["podcast", "episode"],
      playbackCap: ["playable", "pausable", "resumable"],
      metadataCap: ["artwork"],
      browsable: true,
      searchable: true,
    },
    radiobrowser: {
      name: "Radio Browser",
      group: "radio",
      itemTypes: ["station", "metadata"],
      playbackCap: ["playable", "pausable", "resumable", "live"],
      metadataCap: ["artwork", "live"],
      browsable: true,
      searchable: true,
    },
    tunein: {
      name: "TuneIn",
      group: "radio",
      itemTypes: ["station", "metadata"],
      playbackCap: ["playable", "pausable", "resumable", "live"],
      metadataCap: ["artwork", "live"],
      initialBrowseSourceId: "r0",
      browsable: true,
      searchable: true,
    },
    local: {
      name: "Local",
      group: "local",
      itemTypes: ["folder", "track"],
      playbackCap: ["playable", "seekable", "pausable", "resumable"],
      metadataCap: [],
      browsable: false,
      searchable: false,
    },
    stream: {
      name: "Imported",
      group: "radio",
      itemTypes: ["station"],
      playbackCap: ["playable", "seekable", "pausable", "live"],
      metadataCap: ["artwork", "live"],
      browsable: true,
      searchable: true,
    },
  },
  playable: ["track", "episode", "station"],
}

export type CapabilitySourceKey = keyof typeof Capabilities.audioSources
