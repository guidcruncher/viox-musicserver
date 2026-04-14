export interface PlaybackSession {
  sessionId: number
  id: string // session UUID
  startedAt: number
  endedAt?: number
}

export interface PlaybackEvent {
  eventId: number
  sessionId: number
  vioxid: string
  type?: string
  createdAt: number
  finishedAt?: number
}

export interface PlaybackSessionStore {
  startSession(): PlaybackSession
  endSession(id: string): void
  getSession(id: string): PlaybackSession | undefined
  addEvent(sessionUuid: string, vioxid: string, type?: string, finishedAt?: number): number
  getEvents(sessionUuid: string): PlaybackEvent[]
  deleteSession(id: string): void
}
