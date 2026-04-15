import { makeVioxId } from "@/core/makeVioxId"
import { SqliteRadioStore } from "@/infra/radioStore"
import type { AudioSourceAdapter, BrowseOptions, MediaItem, MediaSourceRef } from "@/types"
import { Capabilities } from "@/types"

export class StreamAdapter implements AudioSourceAdapter {
  readonly id = "stream"
  readonly caps = Capabilities.audioSources[this.id]

  constructor(readonly radioStore: SqliteRadioStore) {}

  async getItems(_ref: MediaSourceRef): Promise<MediaItem[] | undefined> {
    return undefined
  }

  async search(query: string, offset: number, limit: number): Promise<MediaItem[]> {
    const results: MediaItem[] = await this.radioStore.search(query)

    return results.slice(offset ?? 0, (offset ?? 0) + (limit ?? 20))
  }

  async getById(ref: MediaSourceRef): Promise<MediaItem | undefined> {
    return await this.radioStore.get(makeVioxId(ref, "item"))
  }

  async getPlaybackUrl(ref: MediaSourceRef): Promise<string | undefined> {
    //    const item = await this.radioStore.get(makeVioxId(ref, "item"))
    //    if (item) return item.sourceRef.uri
    return ref.uri
  }

  async browse(options: BrowseOptions): Promise<MediaItem[]> {
    return await this.radioStore.listWithPaging(options.offset ?? 0, options.limit ?? 20)
  }
}
