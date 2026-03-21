import axios, { AxiosError, AxiosInstance } from "axios"

import { getLogger } from "@/logger"
import { exponentialBackoff } from "@/utils"

export class BaseClient {
  protected http: AxiosInstance
  private readonly log = getLogger()

  constructor(opts: any) {
    this.http = axios.create(opts)
  }

  private async retryable<T>(fn: () => Promise<T>) {
    return exponentialBackoff(fn, {
      retries: 3,
      baseDelayMs: 250,
      maxDelayMs: 4000,
      shouldRetry: (err) => {
        if (!axios.isAxiosError(err)) return false
        if (!err.response) return true // network, timeout, DNS
        return err.response.status >= 500 // retry only 5xx
      },
    })
  }

  private unwrap<T>(data: T | undefined | null): T | undefined {
    if (!data) {
      this.log.warn("No data returned")
      return undefined
    }
    return data
  }

  protected handleError(err: unknown) {
    if (axios.isAxiosError(err)) {
      const e = err as AxiosError

      if (e.response) {
        this.log.error(`HTTP ${e.response.status} – ${e.response.statusText}`, e.response.data)
      } else if (e.request) {
        this.log.error("No response received", e.message)
      } else {
        this.log.error("Request setup error", e.message)
      }
    } else {
      this.log.error("Unknown error", err)
    }
  }

  protected async safeGet<T>(fn: () => Promise<any>): Promise<T | undefined> {
    try {
      const res = await this.retryable(fn)
      return this.unwrap(res.data)
    } catch (err) {
      this.handleError(err)
      return undefined
    }
  }
}
