import { describe, expect, it, vi } from "vitest"

import { exponentialBackoff } from "./exponentialBackoff"

describe("exponentialBackoff", () => {
  it("returns the result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok")
    const result = await exponentialBackoff(fn)
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("retries on failure and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue("ok")

    const result = await exponentialBackoff(fn, { retries: 3, baseDelayMs: 1 })
    expect(result).toBe("ok")
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it("throws after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"))

    await expect(exponentialBackoff(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow(
      "always fails",
    )
    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it("stops retrying when shouldRetry returns false", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fatal"))

    await expect(
      exponentialBackoff(fn, {
        retries: 5,
        baseDelayMs: 1,
        shouldRetry: () => false,
      }),
    ).rejects.toThrow("fatal")
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
