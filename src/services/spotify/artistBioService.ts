// src/services/ArtistBioService.ts
import axios from "axios"

interface ArtistBio {
  id: string
  name: string
  biography: string | null
  genre: string | null
  style: string | null
  formedYear: number | null
  thumb: string | null
  facebook: string | null
  twitter: string | null
  website: string | null
}

class ArtistBioService {
  private readonly baseUrl = "https://theaudiodb.com/api/v1/json/2"

  /**
   * Fetch an artist by name using search.php.
   * Returns null if no artist is found.
   */
  async getArtistByName(name: string): Promise<ArtistBio | null> {
    if (!name.trim()) return null

    const url = `${this.baseUrl}/search.php?s=${encodeURIComponent(name)}`
    const response = await axios.get(url)

    const artist = response.data?.artists?.[0]
    if (!artist) return null

    return this.mapArtist(artist)
  }

  /**
   * Fetch an artist by ID using artist.php.
   * Returns null if no artist is found.
   */
  async getArtistById(id: string): Promise<ArtistBio | null> {
    if (!id.trim()) return null

    const url = `${this.baseUrl}/artist.php?i=${encodeURIComponent(id)}`
    const response = await axios.get(url)

    const artist = response.data?.artists?.[0]
    if (!artist) return null

    return this.mapArtist(artist)
  }

  /**
   * Internal mapper to normalize TheAudioDB fields
   * into your clean ArtistBio model.
   */
  private mapArtist(a: any): ArtistBio {
    return {
      id: a.idArtist,
      name: a.strArtist,
      biography: a.strBiographyEN ?? null,
      genre: a.strGenre ?? null,
      style: a.strStyle ?? null,
      formedYear: a.intFormedYear ? Number(a.intFormedYear) : null,
      thumb: a.strArtistThumb ?? null,
      facebook: a.strFacebook ?? null,
      twitter: a.strTwitter ?? null,
      website: a.strWebsite ?? null,
    }
  }
}

export const artistBioService = new ArtistBioService()
