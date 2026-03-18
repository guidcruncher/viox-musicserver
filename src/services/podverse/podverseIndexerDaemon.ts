import cron from "node-cron"

import { getLogger } from "../../logger"
import { podverseClient } from "./podverseClient"
import { PodverseIndexer } from "./podverseIndexer"
import { SqliteCache } from "./sqliteCache"
import { SqliteStateStore } from "./sqliteStateStore"
import { SqliteSubscriptionStore } from "./sqliteSubscriptionStore"

const state = new SqliteStateStore()
const cache = new SqliteCache()
const subscriptions = new SqliteSubscriptionStore()

export async function InvokeIndexer() {
  const indexer = new PodverseIndexer(podverseClient, state, cache, subscriptions)
  const newItems = await indexer.indexNewEpisodes()
  return newItems
}

export async function RegisterPodverseIndexer(options: any = {}) {
  const indexer = new PodverseIndexer(podverseClient, state, cache, subscriptions)

  // Prevent overlapping runs
  let isRunning = false

  async function runIndexingJob() {
    const logger = getLogger()
    if (isRunning) {
      logger.warn("[Indexer] Skipping run — previous job still running")
      return
    }

    isRunning = true
    logger.debug(`[Indexer] Starting incremental indexing at ${new Date().toISOString()}`)

    try {
      const newItems = await indexer.indexNewEpisodes()

      logger.debug(`[Indexer] Indexed ${newItems.length} new items`)
    } catch (err) {
      logger.error(`[Indexer] Error during indexing: ${err}`)
    } finally {
      isRunning = false
      logger.debug(`[Indexer] Finished at ${new Date().toISOString()}`)
    }
  }

  // ─────────────────────────────────────────────
  // CRON SCHEDULE
  // ─────────────────────────────────────────────
  //
  // Runs every 15 minutes:
  //   */15 * * * *
  // Runs every hour:
  //   0 * * * *
  // Runs every night at 3am:
  //   0 3 * * *
  //
  const logger = getLogger()
  cron.schedule("*/15 * * * *", runIndexingJob)

  logger.debug("[Indexer] Daemon started. Running every 15 minutes.")

  if (options.runOnStartup) {
    logger.debug("[Indexer] Running scan on startup")
    await runIndexingJob()
  }
}
