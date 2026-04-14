import { logger } from "@/logger"
import { HouseKeepingStore } from "@/types"

export class Housekeeping {
  constructor(private readonly housekeeping: HouseKeepingStore) {}

  async backup(): Promise<any> {
    return await this.housekeeping.backup()
  }

  async database() {
    logger.info("Performing vacuum")
    await this.housekeeping.vacuum(30)
    logger.info("Finished vacuum")
  }
}
