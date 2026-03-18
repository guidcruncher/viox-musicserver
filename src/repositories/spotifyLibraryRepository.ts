import { MediaItem } from "../types/media-types"
import { db } from "./db"
import { fromRow, toRow } from "./libraryConvertors"
import { SpotifyLibraryRow } from "./types"

class SpotifyLibraryRepository {
  private insertStmt
  private updateStmt
  private deleteStmt
  private clearStmt
  private selectAllStmt
  private selectOneStmt

  constructor() {
    this.insertStmt = db.prepare(`
      INSERT INTO spotifylibrary (
        id, parent, title, subtitle, img, artist, type, uri,
        format, isFolder, country, bitrate, favourite
      ) VALUES (
        @id, @parent, @title, @subtitle, @img, @artist, @type, @uri,
        @format, @isFolder, @country, @bitrate, @favourite
      )
    `)

    this.updateStmt = db.prepare(`
      UPDATE spotifylibrary SET
        parent = @parent,
        title = @title,
        subtitle = @subtitle,
        img = @img,
        artist = @artist,
        type = @type,
        uri = @uri,
        format = @format,
        isFolder = @isFolder,
        country = @country,
        bitrate = @bitrate,
        favourite = @favourite
      WHERE id = @id
    `)

    this.deleteStmt = db.prepare(`
      DELETE FROM spotifylibrary WHERE id = ?
    `)

    this.clearStmt = db.prepare(`
      DELETE FROM spotifylibrary
    `)

    this.selectAllStmt = db.prepare(`
      SELECT * FROM spotifylibrary
    `)

    this.selectOneStmt = db.prepare(`
      SELECT * FROM spotifylibrary WHERE id = ?
    `)
  }

  add(item: MediaItem): void {
    const row = toRow(item)
    this.insertStmt.run(row)
  }

  update(item: MediaItem): void {
    const row = toRow(item)
    this.updateStmt.run(row)
  }

  delete(id: string): void {
    this.deleteStmt.run(id)
  }

  clear(): void {
    this.clearStmt.run()
  }

  getAll(): MediaItem[] {
    const rows = this.selectAllStmt.all() as SpotifyLibraryRow[]
    return rows.map(fromRow)
  }

  getOne(id: string): MediaItem | undefined {
    const row = this.selectOneStmt.get(id) as SpotifyLibraryRow | undefined
    return row ? fromRow(row) : undefined
  }
}

export const spotifyLibraryRepository = new SpotifyLibraryRepository()
