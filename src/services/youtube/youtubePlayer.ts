import { Innertube } from "youtubei.js"

import { getLogger } from "../../logger"
import { MediaItem } from "../../types/media-types"
import { downloadYouTubeAudio, youtubeProxyUrl } from "./downloadYoutubeAudio"
import { clientType, getInnertube } from "./innertube"
import { mapYoutubeInfoToMediaItem } from "./mapYouTubeItemToMediaItem"

class YouTubePlayer {
  private yt?: Innertube
  private logger: any

  constructor() {
    this.logger = getLogger()
  }

  /**
   * Lazy-initializes the Innertube client
   */
  private async getClient(): Promise<Innertube> {
    if (!this.yt) {
      this.yt = await getInnertube()
    }
    return this.yt
  }

  private parseId(id: string): string {
    const args = id.split(":")
    return args.length === 3 ? args[2] : id
  }

  async getMediaItem(id: string): Promise<MediaItem | undefined> {
    try {
      const ytId = this.parseId(id)
      const client = await this.getClient()

      this.logger.debug(`Querying Youtube for Id ${id}`)

      // Use getBasicInfo for faster metadata or getInfo for full details
      // const song = await client.getInfo(ytId)
      const song = await client.getBasicInfo(ytId, { client: clientType })
      // OR
      // const song = await client.getBasicInfo(ytId, {client: 'ANDROID'});

      if (!song) {
        this.logger.error(`Una/ble to resolve for Id ${id}`)
        return undefined
      }

      const url = youtubeProxyUrl(ytId)
      if (!url) {
        this.logger.error(`Unable to resolve a playback url for Id ${id}`)
        return undefined
      }

      // NOTE: You may need to update your mapper to accept 'song.basic_info'
      const res = mapYoutubeInfoToMediaItem(song)
      res.uri = url
      return res
    } catch (err) {
      this.logger.error(`Error in getMediaItem for ${id}`, err)
      return undefined
    }
  }

  async downloadItem(id: string): Promise<string | undefined> {
    const ytId = this.parseId(id)
    return downloadYouTubeAudio(ytId)
  }

  getPlaybackUrl(id: string): string {
    return youtubeProxyUrl(id)
  }
}

export const youtubePlayer = new YouTubePlayer()
