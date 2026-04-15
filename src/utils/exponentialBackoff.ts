interface BackoffOptions {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (err: unknown) => boolean
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  opts: BackoffOptions = {},
): Promise<T> {
  const { retries = 3, baseDelayMs = 200, maxDelayMs = 5000, shouldRetry = () => true } = opts

  let attempt = 0

  while (true) {
    try {
      return await fn()
    } catch (err) {
      attempt++

      if (attempt > retries || !shouldRetry(err)) {
        throw err
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
