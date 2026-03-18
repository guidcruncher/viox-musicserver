import crypto from "node:crypto"

import { getLogger } from "../../logger"
import { spotifyLibraryRepository } from "../../repositories/spotifyLibraryRepository"
import type { MediaItem } from "../../types/media-types"
import { spotifyWebApi } from "../spotify/spotifyWebClient"
import { migrationWriter } from "./migrationWriter"
import { MatchResult } from "./types"
import { YouTubeMusicMatcher } from "./youtubeMusicMatcher"

type MigrationState = "idle" | "running" | "completed" | "failed"

interface MigrationStatus {
  id: string
  state: MigrationState
  success: number
  fail: number
  count: number
  startedAt?: number
  finishedAt?: number
  error?: string
  results?: any[]
}

export class MigrationService {
  private current: MigrationStatus | null = null
  private matcher: YouTubeMusicMatcher

  constructor(matcher: YouTubeMusicMatcher) {
    this.matcher = matcher
  }

  async startMigration(data?: MediaItem[]): Promise<MigrationStatus> {
    const logger = getLogger()
    const items: MediaItem[] = data ?? []

    if (this.current && this.current.state === "running") {
      logger.error("Migration already running")
      throw new Error("Migration already running")
    }

    const id = crypto.randomUUID()
    logger.info(`Starting migration ${id}`)
    this.current = {
      id,
      success: 0,
      fail: 0,
      count: 0,
      state: "running",
      startedAt: Date.now(),
    }

    this.runInBackground(id, items)
    return this.current
  }

  getStatus(): MigrationStatus | null {
    return this.current
  }

  getStatusById(id: string): MigrationStatus | null {
    if (!this.current) return null
    return this.current.id === id ? this.current : null
  }

  private storeMigrationResults(items: MatchResult[]) {
    migrationWriter.save(items)
  }

  private async runInBackground(id: string, data: MediaItem[]) {
    const logger = getLogger()

    setImmediate(async () => {
      try {
        let items: MediaItem[] = data
        if (!items || items.length <= 0) {
          logger.debug("Fetching current library")
          items = await spotifyWebApi.libraryConsolidator.getLibrary({
            expandPlaylists: true,
          })
          spotifyLibraryRepository.clear()
          items.forEach((item: any) => spotifyLibraryRepository.add(item))

          if (!items || items.length < 0) {
            logger.error({
              error: "Library Items are required, it was not passed or your library is empty.",
            })
            throw new Error(
              "Library Items are required, it was not passed or your library is empty.",
            )
          }
        }

        if (this.current && this.current.id === id) {
          this.current.count = items.length
        }

        logger.info(`Starting to Run in background ${id}`)
        const results = await this.matcher.matchItems(items, (success: boolean) => {
          if (this.current && this.current.id === id) {
            if (success) {
              this.current.success += 1
            } else {
              this.current.fail += 1
            }
          }
        })

        if (this.current && this.current.id === id) {
          logger.info(`Finished Running in background ${id}`)
          this.current.state = "completed"
          this.current.finishedAt = Date.now()
          this.current.results = results
          this.storeMigrationResults(results)
        }
      } catch (err: any) {
        if (this.current && this.current.id === id) {
          this.current.state = "failed"
          this.current.error = err?.message ?? "Unknown error"
          this.current.finishedAt = Date.now()
          logger.error(`Error Running id ${id} - ${this.current.error}`)
        }
      }
    })
  }
}
