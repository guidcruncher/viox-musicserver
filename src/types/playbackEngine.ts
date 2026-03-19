import type { MediaItem, PlaybackState } from "./index"

export interface PlaybackEngine {
  // Playback
  getState(): PlaybackState
  play(): Promise<void>
  pause(): Promise<void>
  stop(): Promise<void>
  seek(positionMs: number): Promise<void>
  next(): Promise<void>
  previous(): Promise<void>

  // Queue
  setQueue(items: MediaItem[], startIndex?: number): Promise<void>
  enqueue(item: MediaItem): Promise<void>
  enqueueNext(item: MediaItem): Promise<void>
  clearQueue(): Promise<void>
  getQueue(): Promise<MediaItem[]>

  // Library
  addToLibrary(item: MediaItem): Promise<void>
  removeFromLibrary(id: string): Promise<void>
  searchLibrary(query: string): Promise<MediaItem[]>

  // Playlists
  createPlaylist(name: string, description?: string): Promise<string>
  addToPlaylist(playlistId: string, item: MediaItem): Promise<void>
  removeFromPlaylist(playlistId: string, itemId: string): Promise<void>
  getPlaylistItems(playlistId: string): Promise<MediaItem[]>

  // Sources
  searchSource(source: string, query: string): Promise<MediaItem[]>
  browseSource(source: string, options: any): Promise<MediaItem[]>
  resolveItem(ref: any): Promise<MediaItem | null>
  resolvePlaybackUrl(ref: any): Promise<string | null>
}
