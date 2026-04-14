import { promises as fs } from "fs"
import path from "path"

interface LocalFileEntry {
  id: string
  name: string
  fullPath: string
  isDirectory: boolean
  extension?: string
}

export class LocalFileSystemClient {
  constructor(private root: string) {}

  async listDirectory(relPath = ""): Promise<LocalFileEntry[]> {
    const dir = path.join(this.root, relPath)
    const entries = await fs.readdir(dir, { withFileTypes: true })

    return entries.map((e) => {
      const fullPath = path.join(dir, e.name)
      const id = path.relative(this.root, fullPath)

      return {
        id,
        name: e.name,
        fullPath,
        isDirectory: e.isDirectory(),
        extension: e.isFile() ? path.extname(e.name).toLowerCase() : undefined,
      }
    })
  }

  async getFile(fullPath: string): Promise<Buffer> {
    return fs.readFile(fullPath)
  }

  isAudioFile(ext?: string): boolean {
    if (!ext) return false
    return [".mp3", ".flac", ".wav", ".aac", ".m4a", ".ogg"].includes(ext)
  }
}
