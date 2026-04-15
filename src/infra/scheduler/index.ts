import { CronJob } from "cron"

import { logger } from "@/logger"
import { VioxBackend } from "@/types"

const timeZone = "UTC"
const jobs: CronJob[] = []

export const registerScheduler = async (backend: VioxBackend) => {
  jobs.push(
    CronJob.from({
      cronTime: "0 0 0 * * *",
      onTick: async () => {
        await backend.housekeeping.backup()

        logger.info("Performing daily cleanup of old cache entries and temporary files")
        await backend.cache.cleanup()
        logger.info("Finished daily cleanup of old cache entries and temporary files")

        await backend.housekeeping.database()
      },
      start: true,
      timeZone: timeZone,
    }),
  )

  jobs.push(
    CronJob.from({
      cronTime: "0 0 5 * * *",
      onTick: async () => {
        logger.info("Commencing daily index of Podcast subscriptions")
        await backend.podcastIndexer.indexAll()
        logger.info("Finished daily index of Podcast subscriptions")
      },
      start: true,
      timeZone: timeZone,
    }),
  )
}
