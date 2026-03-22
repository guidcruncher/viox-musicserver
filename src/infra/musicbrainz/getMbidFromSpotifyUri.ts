import { getLogger } from "@/logger"
import axios from "axios"

const logger = getLogger()

const client = axios.create({
  baseURL: "https://musicbrainz.org/ws/2",
  timeout: 10_000,
  headers: {
    "User-Agent": "MusicBrainzClient/1.0.0 (contact@example.com)",
    Accept: "application/json",
  },
})

const parseSpotifyUriToUrl = (uri: string): string => {
  const parts = uri.split(":")
  const validTypes = ["track", "album", "artist"]

  if (parts.length !== 3 || parts[0] !== "spotify") {
    throw new Error(`Invalid Spotify URI format: ${uri}`)
  }

  const type = parts[1]
  const id = parts[2]

  if (!validTypes.includes(type)) {
    throw new Error(`Type ${type} is not a valid Spotify type, expected [${validTypes.join(", ")}]`)
  }

  return `https://open.spotify.com/${type}/${id}`
}

export const getMbidFromSpotifyUri = async (uri: string): Promise<string[]> => {
  const spotifyUrl = parseSpotifyUriToUrl(uri)

  const mbUrl = `/url?resource=${encodeURIComponent(
    spotifyUrl,
  )}&inc=recording-rels+release-rels+artist-rels&fmt=json`

  try {
    const { data } = await client.get(mbUrl)

    const relations = data.relationsF || []
    return relations
      .map((rel: any) => rel.recording?.id || rel.release?.id || rel.artist?.id)
      .filter(Boolean)
  } catch (err: any) {
    if (err.response?.status === 404) return []
    logger.error(`MusicBrainz API Error: ${err.response?.status}`, err)
    return []
  }
}

export const getMbidsFromIsrc = async (isrc: string): Promise<string[]> => {
  try {
    const { data } = await client.get(`/isrc/${isrc}?fmt=json`)
    return data.recordings?.map((rec: any) => rec.id) ?? []
  } catch (err: any) {
    if (err.response?.status === 404) return []
    logger.error(`MusicBrainz API Error: ${err.response?.status}`, err)
    return []
  }
}
