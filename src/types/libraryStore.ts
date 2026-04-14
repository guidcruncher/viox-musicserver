import { AudioSourceItemType, MediaItem, MediaSourceRef } from "./index"

export interface LibraryStore {
  upsert(items: MediaItem[]): Promise<void>
  remove(id: string): Promise<void>
  get(id: string): Promise<MediaItem | undefined>
  findBySourceRef(ref: MediaSourceRef): Promise<MediaItem | undefined>
  findBySourceId(id: string): Promise<MediaItem | undefined>
  search(query: string): Promise<MediaItem[]> // local search
  list(): Promise<MediaItem[]>
  listWithPaging(offset: number, limit: number): Promise<MediaItem[]>
  listByItemTypes(itemTypes: AudioSourceItemType | AudioSourceItemType[]): Promise<MediaItem[]>
  listByItemTypesWithPaging(
    itemTypes: AudioSourceItemType | AudioSourceItemType[],
    offset: number,
    limit: number,
  ): Promise<MediaItem[]>
  inLibrary(id: string): Promise<boolean>
}
