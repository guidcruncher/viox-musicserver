import { parseVioxId } from "@/core/makeVioxId"
import { eventBus } from "@/infra/eventbus/eventBus"
import { musicBrainzClient } from "@/infra/musicbrainz/musicBrainzClient"
import { nowPlayingStore } from "@/infra/nowPlayingStore"
import { sourceRegistry } from "@/infra/sources/sourceRegistry"
import { logger } from "@/logger"
import type {
  BackendRouter,
  LibraryStore,
  MediaItem,
  MediaItemStore,
  PlaybackBackend,
  PlaybackSessionStore,
  PlaylistStore,
  TrackStore,
} from "@/types"

import { GlobalQueue } from "./playbackQueue"

/**
 * Manages audio playback state, queue navigation, and backend routing.
 */
export class PlaybackController {
  private cursor = -1
  private currentBackend: PlaybackBackend | null = null
  private currentSessionId: string | null = null

  constructor(
    private readonly queue: GlobalQueue,
    private readonly stores: {
      cache: MediaItemStore
      library: LibraryStore
      playlist: PlaylistStore
      radio: MediaItemStore
      tracks: TrackStore
    },
    private readonly router: BackendRouter,
    private readonly sessions: PlaybackSessionStore,
  ) {
    logger.info("playback: controller initialised")

    // Clear stale queue from a previous session if nothing is currently playing.
    // On container restart the queue events are replayed from the database, but
    // nowPlayingStore is wiped by the entrypoint. A non-empty queue with no
    // active track leads to confusing state (e.g. duplicate-check skipping the
    // track the user wants to play).
    if (!nowPlayingStore.current() && this.queue.snapshot.length > 0) {
      logger.info("playback: clearing stale queue from previous session")
      this.queue.clear()
    }

    // Listen for track completion from the active backend
    eventBus.on("finished", () => {
      logger.info("playback: track finished event received")
      this.handleTrackFinished()
    })
  }

  // --- Private Helpers ---

  public async resolveItem(id: string): Promise<MediaItem> {
    const { library, radio, tracks, cache } = this.stores
    const item =
      (await library.get(id)) ||
      (await tracks.get(id)) ||
      (await radio.get(id)) ||
      (await cache.get(id))

    if (!item) {
      logger.error({ id }, "playback: could not resolve media item")
      throw new Error(`MediaItem ${id} not found`)
    }
    return item
  }

  private async getParentUri(parentId?: string): Promise<string | undefined> {
    if (!parentId) return undefined
    return parentId.includes("viox:playlist")
      ? (await this.stores.playlist.get(parentId))?.sourceUri
      : (await this.stores.library.get(parentId))?.sourceRef.uri
  }

  private logSessionEvent(event: string, extra?: any) {
    const item = nowPlayingStore.current()
    if (this.currentSessionId && item) {
      this.sessions.addEvent(this.currentSessionId, item.id, event, extra)
    }
  }

  private async handleTrackFinished(): Promise<void> {
    this.logSessionEvent("finished")

    if (this.cursor + 1 >= this.queue.snapshot.length) {
      logger.info("playback: end of queue reached")
      await this.stop()
      return
    }

    this.cursor += 1
    await this.playFromQueue()
  }

  // --- Public API ---

  public async deleteAtQueueIndex(index: number): Promise<void> {
    const items = this.queue.trackIds
    if (index < 0 || index > items.length) return

    await this.queue.deleteByIndex(index)
  }

  public async getQueue(): Promise<MediaItem[]> {
    const items = this.queue.trackIds
    const mediaItems: MediaItem[] = []
    for (const trackId of items) {
      const item = await this.resolveItem(trackId)
      if (item) {
        mediaItems.push(item)
      }
    }
    return mediaItems
  }

  public async clearQueue(): Promise<void> {
    await this.queue.clear()
    this.cursor = -1
    await this.stop()
  }

  /**
   * Enqueues an item (or its contents if it's an album/playlist) and starts playback if idle.
   */
  async enqueueAndPlay(ids?: string[], parent?: string): Promise<MediaItem | undefined> {
    if (!ids) return undefined

    try {
      let tracksToQueue: string[] = []
      for (const id of ids) {
        const vioxId = parseVioxId(id)
        if (!vioxId) {
          logger.error(`Invalid Viox ID: ${id}`)
          continue
        }

        // Resolve contents based on type
        if (vioxId.type === "playlist") {
          const items = await this.stores.playlist.getItems(id)
          tracksToQueue = items.map((i) => i.id)
        } else {
          const item = await this.resolveItem(id)
          if (item.sourceRef.itemType === "album") {
            const albumTracks = await this.stores.tracks.listByParentSourceId(
              item.sourceRef.sourceId,
            )

          if (albumTracks) {
              this.stores.cache.upsert(albumTracks)
              tracksToQueue = albumTracks.map((t) => t.id)
            }
          } else {
            tracksToQueue = [item.id]
          }
        }
      }

      if (tracksToQueue.length === 0) {
        logger.warn("Nothing found to queue, aborting enqueueAndPlayback")
        return
      }

      // Enqueue all tracks
      let firstQueueId: string | undefined
      const lastQueuedItem = this.queue.lastQueueEntry()

      if (lastQueuedItem && lastQueuedItem.trackId === tracksToQueue[0]) {
        tracksToQueue.shift()
      }

      if (tracksToQueue.length === 0) return

      for (const trackId of tracksToQueue) {
        const queued = this.queue.enqueue(trackId, { parent })
        if (!firstQueueId) firstQueueId = queued.queueId
      }

      // If nothing is playing, start the first item of this new set
      if (!nowPlayingStore.current() && firstQueueId) {
        this.cursor = this.queue.snapshot.findIndex((i) => i.queueId === firstQueueId)
        return await this.playFromQueue()
      }

      return nowPlayingStore.current()
    } catch (err) {
      logger.error("playback: enqueueAndPlay failed", err)
return undefined
    }
  }

  async playFromQueue(): Promise<MediaItem | undefined> {
    const items = this.queue.snapshot
    if (this.cursor < 0 || this.cursor >= items.length) {
      logger.warn({ cursor: this.cursor }, "playback: cursor out of bounds")
      return
    }

    const queueItem = items[this.cursor]
    const mediaItem = await this.resolveItem(queueItem.trackId)
    const parentUri = await this.getParentUri(queueItem.metadata?.parent)

    await this.playItem(mediaItem, parentUri)
    return mediaItem
  }

  async playItem(item: MediaItem, parentSourceUri?: string): Promise<void> {
    try {
      const backend = this.router.resolveBackendFor(item)
      const audioSource = sourceRegistry.get(item.sourceRef.source)

      if (!backend || !audioSource) {
        throw new Error(`Unsupported source: ${item.sourceRef.source}`)
      }

      // Enrich metadata via MusicBrainz if supported
      if (audioSource.caps.metadataCap.includes("musicbrainz") && item.isrc) {
        await musicBrainzClient.getMbidRecordFromIsrc(item.isrc).catch(() => null)
      }

      // Resolve temporary playback URLs (e.g., signed S3 or YouTube streams)
      if (audioSource.getPlaybackUrl) {
        item.sourceRef.uri = await audioSource.getPlaybackUrl(item.sourceRef)
      }

      // Clean up previous backend if switching types (e.g., Spotify -> Local)
      if (this.currentBackend && this.currentBackend !== backend) {
        await this.currentBackend.stop().catch((e) => logger.warn(e))
      }

      this.currentBackend = backend

      await backend.play(item, parentSourceUri)

      // Only update now-playing state after playback has started successfully
      nowPlayingStore.update(item)

      const session = this.sessions.startSession()
      this.currentSessionId = session.id
      this.logSessionEvent("play")
    } catch (err) {
      // Clean up state so the controller doesn't think something is playing
      nowPlayingStore.remove()
      this.currentBackend = null
      if (this.currentSessionId) {
        this.sessions.endSession(this.currentSessionId)
        this.currentSessionId = null
      }
      logger.error("playback: playItem critical failure", { err, itemId: item.id })
    }
  }

  // --- Navigation ---

  async next(): Promise<MediaItem | undefined> {
    if (this.cursor + 1 >= this.queue.snapshot.length) return
    this.logSessionEvent("next")
    this.cursor++
    return this.playFromQueue()
  }

  async previous(): Promise<MediaItem | undefined> {
    if (this.cursor - 1 < 0) return
    this.logSessionEvent("previous")
    this.cursor--
    return this.playFromQueue()
  }

  async selectTrack(id: string): Promise<MediaItem | undefined> {
    const index = this.queue.snapshot.findIndex((i) => i.trackId === id)
    if (index === -1) return

    this.logSessionEvent("selectTrack")
    this.cursor = index
    return this.playFromQueue()
  }

  // --- Transport Control ---

  async pause(): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.pause()
    this.logSessionEvent("pause")
  }

  async resume(): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.resume()
    this.logSessionEvent("resume")
  }

  async stop(): Promise<void> {
    this.logSessionEvent("stop")
    if (this.currentSessionId) {
      this.sessions.endSession(this.currentSessionId)
      this.currentSessionId = null
    }
    if (this.currentBackend) await this.currentBackend.stop()
    this.currentBackend = null
    nowPlayingStore.remove()
  }

  async seek(position: number): Promise<void> {
    if (!this.currentBackend) return
    await this.currentBackend.seek(position)
    this.logSessionEvent("seek", position)
  }

  // --- Logging Updates ---

  logPosition(ms: number): void {
    this.logSessionEvent("position", ms)
  }
  logBufferingStart(): void {
    this.logSessionEvent("buffering_start")
  }
  logBufferingEnd(): void {
    this.logSessionEvent("buffering_end")
  }
  logError(error: Error): void {
    logger.error({ error }, "playback: backend error")
    this.logSessionEvent("error")
  }

  getCurrentItem(): MediaItem | undefined {
    return nowPlayingStore.current()
  }
}
