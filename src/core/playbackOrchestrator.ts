import type {
  BackendRouter,
  LibraryStore,
  MediaItem,
  PlaybackBackend,
  PlaybackOrchestrator,
  PlaybackState,
  QueueStore,
} from "@/types"

export class DefaultPlaybackOrchestrator implements PlaybackOrchestrator {
  private state: PlaybackState = { type: "idle" }
  private currentBackend: PlaybackBackend | null = null
  private currentItem: MediaItem | null = null

  constructor(
    private readonly queue: QueueStore,
    private readonly library: LibraryStore,
    private readonly router: BackendRouter,
  ) {}

  getState(): PlaybackState {
    return this.state
  }

  async load(item: MediaItem): Promise<void> {
    this.currentItem = item
    this.currentBackend = this.router.resolveBackendFor(item)
    this.state = { type: "loading", item }
  }

  async play(): Promise<void> {
    if (!this.currentItem) {
      const id = await this.queue.getCurrent()
      if (!id) {
        this.state = { type: "idle" }
        return
      }
      const item = await this.library.get(id)
      if (!item) {
        this.state = {
          type: "error",
          error: { code: "UNAVAILABLE", message: "Item not found" },
        }
        return
      }
      await this.load(item)
    }

    const backend = this.currentBackend!
    const item = this.currentItem!
    await backend.play(item)
    this.state = { type: "playing", item, positionMs: 0 }
  }

  async pause(): Promise<void> {
    if (!this.currentBackend || !this.currentItem) return
    await this.currentBackend.pause()
    const pos = await this.currentBackend.getPosition()
    this.state = { type: "paused", item: this.currentItem, positionMs: pos }
  }

  async stop(): Promise<void> {
    if (!this.currentBackend || !this.currentItem) return
    await this.currentBackend.stop()
    this.state = { type: "ended", item: this.currentItem }
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.currentBackend || !this.currentItem) return
    await this.currentBackend.seek(positionMs)
    this.state = {
      type: "playing",
      item: this.currentItem,
      positionMs,
    }
  }

  async next(): Promise<void> {
    const nextId = await this.queue.getNext()
    if (!nextId) return
    const item = await this.library.get(nextId)
    if (!item) return

    await this.queue.setCurrentIndex((await this.queue.getQueue()).indexOf(nextId))

    await this.load(item)
    await this.play()
  }

  async previous(): Promise<void> {
    const prevId = await this.queue.getPrevious()
    if (!prevId) return
    const item = await this.library.get(prevId)
    if (!item) return

    await this.queue.setCurrentIndex((await this.queue.getQueue()).indexOf(prevId))

    await this.load(item)
    await this.play()
  }
}
