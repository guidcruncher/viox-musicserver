import { MediaItem } from "../types/media-types"
import { db } from "./db"
import { fromRow, toRow } from "./libraryConvertors"
import { MigrationLibraryRow } from "./types"

class MigrationLibraryRepository {
  private insertStmt
  private updateStmt
  private deleteStmt
  private clearStmt
  private selectAllStmt
  private selectOneStmt

  constructor() {
    this.insertStmt = db.prepare(`
      INSERT INTO migrationlibrary (
        id, parent, title, subtitle, img, artist, type, uri,
        format, isFolder, country, bitrate, favourite
      ) VALUES (
        @id, @parent, @title, @subtitle, @img, @artist, @type, @uri,
        @format, @isFolder, @country, @bitrate, @favourite
      )
    `)

    this.updateStmt = db.prepare(`
      UPDATE migrationlibrary SET
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
      DELETE FROM migrationlibrary WHERE id = ?
    `)

    this.clearStmt = db.prepare(`
      DELETE FROM migrationlibrary
    `)

    this.selectAllStmt = db.prepare(`
      SELECT * FROM migrationlibrary
    `)

    this.selectOneStmt = db.prepare(`
      SELECT * FROM migrationlibrary WHERE id = ?
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
    const rows = this.selectAllStmt.all() as MigrationLibraryRow[]
    return rows.map(fromRow)
  }

  getOne(id: string): MediaItem | undefined {
    const row = this.selectOneStmt.get(id) as MigrationLibraryRow | undefined
    return row ? fromRow(row) : undefined
  }
}

export const migrationLibraryRepository = new MigrationLibraryRepository()
