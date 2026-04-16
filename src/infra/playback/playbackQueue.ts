import { randomUUID } from "crypto"

import { QueueEvent, QueueItem, QueueStore } from "@/types"

export class GlobalQueue {
  private items: QueueItem[] = []
  private events: QueueEvent[] = []
  private seq = 0

  get trackIds(): string[] {
    return this.items.map((item) => item.trackId)
  }

  constructor(private readonly store: QueueStore) {
    const events = store.getQueueEvents()
    this.replay(events)
  }

  private now(): number {
    return Math.floor(Date.now() / 1000)
  }

  private nextSeq(): number {
    this.seq += 1
    return this.seq
  }

  // --------------------------------------------------------------------------
  // Event application (pure functions)
  // --------------------------------------------------------------------------
  private applyDeleteByIndex(ev: QueueEvent) {
    const index = ev.payload.index
    if (index < 0 || index >= this.items.length) return

    this.items.splice(index, 1)
  }

  private applyEnqueue(ev: QueueEvent) {
    this.items.push(ev.payload.item)
  }

  private applyRemove(ev: QueueEvent) {
    this.items = this.items.filter((i) => i.queueId !== ev.payload.queueId)
  }

  private applyClear() {
    this.items = []
  }

  private applyReorder(ev: QueueEvent) {
    const map = new Map(this.items.map((i: any) => [i.queueId, i]))
    this.items = ev.payload.newOrder.map((id: any) => map.get(id)!)
  }

  private applyEvent(ev: QueueEvent) {
    switch (ev.type) {
      case "enqueue":
        return this.applyEnqueue(ev)
      case "remove":
        return this.applyRemove(ev)
      case "clear":
        return this.applyClear()
      case "reorder":
        return this.applyReorder(ev)
      case "deleteByIndex":
        return this.applyDeleteByIndex(ev)
    }
  }

  // --------------------------------------------------------------------------
  // Core operations (event-first)
  // --------------------------------------------------------------------------

  lastQueueEntry(): QueueItem | undefined {
    if (this.items.length === 0) return undefined
    return this.items[this.items.length - 1]
  }

  deleteByIndex(index: number): boolean {
    if (index < 0 || index >= this.items.length) return false

    const seq = this.nextSeq()

    const ev: QueueEvent = {
      type: "deleteByIndex",
      seq,
      createdAt: this.now(),
      payload: { index },
    }

    this.store.appendEvent(ev.seq, ev.type, ev.payload)
    this.applyEvent(ev)
    this.store.updatePositions(this.items)

    this.events.push(ev)
    return true
  }

  enqueue(trackId: string, metadata?: Record<string, any>): QueueItem {
    const seq = this.nextSeq()

    const item: QueueItem = {
      queueId: randomUUID(),
      trackId,
      position: this.items.length, // canonical: index, not seq
      addedAt: this.now(),
      metadata,
    }

    const ev: QueueEvent = {
      type: "enqueue",
      seq,
      createdAt: this.now(),
      payload: { item },
    }

    this.store.appendEvent(ev.seq, ev.type, ev.payload)
    this.applyEvent(ev)
    this.store.updatePositions(this.items)

    this.events.push(ev)
    return item
  }

  remove(queueId: string): boolean {
    const exists = this.items.some((i) => i.queueId === queueId)
    if (!exists) return false

    const seq = this.nextSeq()

    const ev: QueueEvent = {
      type: "remove",
      seq,
      createdAt: this.now(),
      payload: { queueId },
    }

    this.store.appendEvent(ev.seq, ev.type, ev.payload)
    this.applyEvent(ev)
    this.store.updatePositions(this.items)

    this.events.push(ev)
    return true
  }

  clear(): void {
    const seq = this.nextSeq()

    const ev: QueueEvent = {
      type: "clear",
      seq,
      createdAt: this.now(),
      payload: {},
    }

    this.store.appendEvent(ev.seq, ev.type, ev.payload)
    this.applyEvent(ev)
    this.store.clear()

    this.events.push(ev)
  }

  reorder(newOrder: string[]): boolean {
    if (newOrder.length !== this.items.length) return false

    const seq = this.nextSeq()

    const ev: QueueEvent = {
      type: "reorder",
      seq,
      createdAt: this.now(),
      payload: { newOrder },
    }

    this.store.appendEvent(ev.seq, ev.type, ev.payload)
    this.applyEvent(ev)
    this.store.updatePositions(this.items)

    this.events.push(ev)
    return true
  }

  // --------------------------------------------------------------------------
  // Deterministic replay
  // --------------------------------------------------------------------------

  replay(events: QueueEvent[]): void {
    this.items = []
    this.events = []
    this.seq = 0

    const sorted = [...events].sort((a, b) => a.seq - b.seq)

    for (const ev of sorted) {
      this.seq = Math.max(this.seq, ev.seq)
      this.applyEvent(ev)
      this.events.push(ev)
    }
  }

  get snapshot(): QueueItem[] {
    return [...this.items]
  }

  get eventLog(): QueueEvent[] {
    return [...this.events]
  }
}
