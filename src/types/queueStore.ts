export interface QueueStore {
  setQueue(itemIds: string[], startIndex?: number): Promise<void>
  enqueue(itemId: string): Promise<void>
  enqueueNext(itemId: string): Promise<void>
  remove(itemId: string): Promise<void>
  clear(): Promise<void>

  getQueue(): Promise<string[]>
  getCurrent(): Promise<string | undefined>
  getNext(): Promise<string | undefined>
  getPrevious(): Promise<string | undefined>

  setCurrentIndex(index: number): Promise<void>
}
