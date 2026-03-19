import { EVENT_DEFINITIONS } from "./appEvents"
import { EventEmitter } from "node:events"

export type AppEvents = typeof EVENT_DEFINITIONS
export type EventKey = keyof AppEvents
export const EVENT_KEYS = Object.keys(EVENT_DEFINITIONS) as EventKey[]

export class EventBus {
  private bus = new EventEmitter()
  private clientListeners = new Map<string, Map<EventKey, Function>>()

  subscribe<K extends EventKey>(
    connectionId: string,
    event: K,
    callback: (data: AppEvents[K]) => void,
  ) {
    this.bus.on(event, callback)

    if (!this.clientListeners.has(connectionId)) {
      this.clientListeners.set(connectionId, new Map())
    }
    this.clientListeners.get(connectionId)!.set(event, callback)
  }

  cleanup(connectionId: string) {
    const listeners = this.clientListeners.get(connectionId)
    if (listeners) {
      listeners.forEach((cb, ev) => this.bus.off(ev, cb as any))
      this.clientListeners.delete(connectionId)
    }
  }

  emit<K extends EventKey>(event: K, data: AppEvents[K]) {
    this.bus.emit(event, data)
  }
}

export const eventBus = new EventBus()
