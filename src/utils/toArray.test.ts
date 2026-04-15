import { describe, expect, it } from "vitest"

import { toArray } from "./toArray"

describe("toArray", () => {
  it("wraps a single value in an array", () => {
    expect(toArray(42)).toEqual([42])
  })

  it("returns the same array if already an array", () => {
    expect(toArray([1, 2, 3])).toEqual([1, 2, 3])
  })

  it("wraps a string in an array", () => {
    expect(toArray("hello")).toEqual(["hello"])
  })

  it("returns an empty array as-is", () => {
    expect(toArray([])).toEqual([])
  })
})
