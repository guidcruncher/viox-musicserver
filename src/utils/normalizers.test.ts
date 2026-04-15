import { describe, expect, it } from "vitest"

import { normalizeUrl } from "./normalizers"

describe("normalizeUrl", () => {
  it("returns empty string for falsy input", () => {
    expect(normalizeUrl("")).toBe("")
  })

  it("proxies https URLs through /api/image", () => {
    const url = "https://example.com/image.jpg"
    expect(normalizeUrl(url)).toBe("/api/image?url=" + encodeURIComponent(url))
  })

  it("proxies http:// URLs through /api/image", () => {
    const url = "http://example.com/pic.png"
    expect(normalizeUrl(url)).toBe("/api/image?url=" + encodeURIComponent(url))
  })

  it("returns non-http URLs unchanged", () => {
    expect(normalizeUrl("/local/path.jpg")).toBe("/local/path.jpg")
  })
})
