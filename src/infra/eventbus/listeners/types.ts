export interface goLibrespotMetaData {
  context_uri: string
  uri: string
  name: string
  artist_names: string[]
  album_name: string
  album_cover_url: string
  position: number
  duration: number
}

export interface goLibrespotPaused {
  context_uri: string
  uri: string
  play_origin: string
}

export interface goLibrespotNotPlaying {
  context_uri: string
  uri: string
  play_origin: string
}

export interface goLibrespotSeek {
  context_uri: string
  uri: string
  position: number
  duration: number
  play_origin: string
}
