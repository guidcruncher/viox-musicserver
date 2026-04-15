import { describe, expect, it } from "vitest"

import { makeVioxId, parseVioxId } from "./makeVioxId"

describe("makeVioxId", () => {
  it("produces a deterministic viox: prefixed ID", () => {
    const ref = {
      source: "spotify",
      itemType: "track",
      sourceId: "abc123",
      uri: "spotify:track:abc123",
    }
    const id = makeVioxId(ref, "track")
    expect(id).toMatch(/^viox:track:[a-f0-9]{16}$/)
  })

  it("produces the same ID for the same input", () => {
    const ref = {
      source: "spotify",
      itemType: "track",
      sourceId: "abc123",
      uri: "spotify:track:abc123",
    }
    const id1 = makeVioxId(ref, "track")
    const id2 = makeVioxId(ref, "track")
    expect(id1).toBe(id2)
  })

  it("produces different IDs for different inputs", () => {
    const ref1 = { source: "spotify", itemType: "track", sourceId: "abc123", uri: "" }
    const ref2 = { source: "spotify", itemType: "track", sourceId: "xyz789", uri: "" }
    expect(makeVioxId(ref1, "track")).not.toBe(makeVioxId(ref2, "track"))
  })

  it("handles missing uri by defaulting to empty string", () => {
    const ref = { source: "tunein", itemType: "station", sourceId: "s12345" }
    const id = makeVioxId(ref as any, "media")
    expect(id).toMatch(/^viox:media:[a-f0-9]{16}$/)
  })
})

describe("parseVioxId", () => {
  it("parses a valid viox ID", () => {
    const parsed = parseVioxId("viox:track:abcdef1234567890")
    expect(parsed).toEqual({ source: "viox", type: "track", id: "abcdef1234567890" })
  })

  it("throws on invalid format (missing parts)", () => {
    expect(() => parseVioxId("viox:track")).toThrow("Invalid Viox ID")
  })

  it("throws on invalid prefix", () => {
    expect(() => parseVioxId("notviox:track:abc")).toThrow("Invalid Viox ID")
  })
})
