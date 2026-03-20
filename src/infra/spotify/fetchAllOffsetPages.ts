import { getLogger } from "@/logger"

const log = getLogger()

/**
 * Fetches ALL pages from an offset‑based API and returns a flat array.
 *
 * @param fetchPage  A function that accepts (offset: number, ...args)
 *                   and returns a page:
 *                   { items: T[], next: string | null }
 *
 * @param pageSize   The limit used by the API (default 50)
 * @param args       Additional parameters passed to fetchPage
 */
export const fetchAllOffsetPages = async <T, A extends any[] = any[]>(
  fetchPage: (
    offset: number,
    ...args: A
  ) => Promise<{ items: T[]; next: string | null } | undefined>,
  pageSize = 50,
  ...args: A
): Promise<T[] | undefined> => {
  const results: T[] = []
  let offset = 0
  let iteration = 0

  while (true) {
    let page: { items: T[]; next: string | null } | undefined

    try {
      page = await fetchPage(offset, ...args)
    } catch (err) {
      log.error("[Pagination] Error fetching page", err)
      return undefined
    }

    // If no page or no items → assume finished
    if (!page || !Array.isArray(page.items) || page.items.length === 0) {
      if (iteration == 0) {
        log.warn(`Finished fetchAllOffsetPages after ${iteration} pages`)
      } else {
        log.debug(`Finished fetchAllOffsetPages after ${iteration} pages`)
      }
      return results
    }

    results.push(...page.items)
    iteration += 1
    // Spotify returns `next: null` when done
    if (!page.next) {
      log.debug(`Finished fetchAllOffsetPages after ${iteration} pages`)
      return results
    }
    offset += pageSize
  }
}
