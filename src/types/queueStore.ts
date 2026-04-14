import { MediaItem } from "./mediaItem"

export interface QueueItem {
  queueId: string
  trackId: string
  position: number
  addedAt: number
  metadata?: Record<string, any>
}

export interface QueueEvent {
  seq: number
  type: "enqueue" | "remove" | "reorder" | "clear"
  payload: any
  createdAt: number
}

export interface QueueStore {
  // Load full queue state
  getQueueItems(): QueueItem[]

  getQueueContents(): MediaItem[]

  getQueueEvents(): QueueEvent[]

  // Mutations
  insertItem(item: QueueItem): void

  updatePositions(items: QueueItem[]): void

  removeItem(queueId: string): void

  clear(): void

  reset(): void

  // Event log
  appendEvent(seq: number, type: string, payload: any): void
}
