import fs from "fs"

import { MediaItem } from "@/types"

class NowPlayingStore {
  private readonly nowPlayingStore = "/data/nowplaying.json"

  update(item: MediaItem | undefined): MediaItem | undefined {
    if (item) {
      fs.writeFileSync(this.nowPlayingStore, JSON.stringify(item), "utf8")
      return item
    }

    this.remove()
    return undefined
  }

  current(): MediaItem | undefined {
    if (!fs.existsSync(this.nowPlayingStore)) return undefined

    return JSON.parse(fs.readFileSync(this.nowPlayingStore, "utf8"))
  }

  remove() {
    if (fs.existsSync(this.nowPlayingStore)) fs.unlinkSync(this.nowPlayingStore)
  }
}

export const nowPlayingStore = new NowPlayingStore()
