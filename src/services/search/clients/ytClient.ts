import { Innertube } from "youtubei.js"

import { getInnertube } from "../../youtube/innertube"

let ytInstance: Innertube | null = null

export async function getYoutubeClient() {
  if (!ytInstance) {
    ytInstance = await getInnertube()
  }
  return ytInstance
}
