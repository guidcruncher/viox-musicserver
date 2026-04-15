import { describe, expect, it, vi } from "vitest"

import { normalizeType } from "./normalizeType"

describe("normalizeType", () => {
  it("wraps a single type string into an array", () => {
    const req = { query: { type: "track" } }
    const done = vi.fn()
    normalizeType(req, {}, done)
    expect(req.query.type).toEqual(["track"])
    expect(done).toHaveBeenCalled()
  })

  it("leaves an existing array unchanged", () => {
    const req = { query: { type: ["track", "album"] } }
    const done = vi.fn()
    normalizeType(req, {}, done)
    expect(req.query.type).toEqual(["track", "album"])
    expect(done).toHaveBeenCalled()
  })

  it("does nothing when type is undefined", () => {
    const req = { query: {} }
    const done = vi.fn()
    normalizeType(req, {}, done)
    expect(req.query).toEqual({})
    expect(done).toHaveBeenCalled()
  })
})
