impor { MediaItem, Playlist  } from "./index"

export interface PlaylistStore {
  // Playlist CRUD
  create(name: string, description?: string): Promise<string>;
  rename(id: string, name: string): Promise<void>;
  updateDescription(id: string, description: string): Promise<void>;
  updateImage(id: string, imageUrl: string): Promise<void>;
  delete(id: string): Promise<void>;

  // Playlist retrieval
  get(id: string): Promise<Playlist | undefined>;
  list(): Promise<Playlist[]>;

  // Playlist items
  addItem(playlistId: string, itemId: string): Promise<void>;
  addItems(playlistId: string, itemIds: string[]): Promise<void>;
  removeItem(playlistId: string, itemId: string): Promise<void>;
  clearItems(playlistId: string): Promise<void>;

  // Ordering
  reorderItem(
    playlistId: string,
    itemId: string,
    newPosition: number
  ): Promise<void>;

  // Retrieval
  getItems(playlistId: string): Promise<MediaItem[]>;
}
