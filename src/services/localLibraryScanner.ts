import fs from "node:fs"
import path from "node:path"

import { LocalFileNormalizer } from "@/core/normalizers/localNormalizer"
import type { LibraryStore, MediaItem } from "@/types"

export class LocalLibraryScanner {
  private readonly normalize = new LocalFileNormalizer()

  constructor(
    private readonly library: LibraryStore,
    private readonly metadata: any, // injected metadata extractor
  ) {}

  async scan(root: string): Promise<void> {
    const files = this.walk(root)
    const items: MediaItem[] = []

    for (const file of files) {
      if (!this.isAudio(file)) continue

      const raw = await this.metadata.extract(file)
      const normalized = this.normalize.normalize(raw)
      items.push(normalized)
    }

    await this.library.upsert(items)
  }

  private walk(dir: string): string[] {
    let results: string[] = []
    const list = fs.readdirSync(dir)

    for (const file of list) {
      const full = path.join(dir, file)
      const stat = fs.statSync(full)

      if (stat.isDirectory()) {
        results = results.concat(this.walk(full))
      } else {
        results.push(full)
      }
    }

    return results
  }

  private isAudio(file: string): boolean {
    return /\.(mp3|flac|wav|aac|m4a|ogg)$/i.test(file)
  }
}
