import { describe, expect, it } from "vitest"

import { isSafeExternalUrl } from "./urlValidator"

describe("isSafeExternalUrl", () => {
  it("allows valid external https URLs", () => {
    expect(isSafeExternalUrl("https://example.com/path")).toBe(true)
  })

  it("allows valid external http URLs", () => {
    expect(isSafeExternalUrl("http://cdn.example.com/img.jpg")).toBe(true)
  })

  it("rejects invalid URLs", () => {
    expect(isSafeExternalUrl("not-a-url")).toBe(false)
  })

  it("rejects non-http schemes (ftp)", () => {
    expect(isSafeExternalUrl("ftp://example.com/file")).toBe(false)
  })

  it("rejects file:// scheme", () => {
    expect(isSafeExternalUrl("file:///etc/passwd")).toBe(false)
  })

  it("blocks localhost", () => {
    expect(isSafeExternalUrl("http://localhost:3000")).toBe(false)
  })

  it("blocks metadata.google.internal", () => {
    expect(isSafeExternalUrl("http://metadata.google.internal/computeMetadata")).toBe(false)
  })

  it("blocks 127.x.x.x loopback", () => {
    expect(isSafeExternalUrl("http://127.0.0.1:8080")).toBe(false)
  })

  it("blocks 10.x.x.x private range", () => {
    expect(isSafeExternalUrl("http://10.0.0.1")).toBe(false)
  })

  it("blocks 172.16-31.x.x private range", () => {
    expect(isSafeExternalUrl("http://172.16.0.1")).toBe(false)
    expect(isSafeExternalUrl("http://172.31.255.255")).toBe(false)
  })

  it("blocks 192.168.x.x private range", () => {
    expect(isSafeExternalUrl("http://192.168.1.1")).toBe(false)
  })

  it("blocks 169.254.x.x link-local", () => {
    expect(isSafeExternalUrl("http://169.254.169.254")).toBe(false)
  })

  it("blocks 0.0.0.0", () => {
    expect(isSafeExternalUrl("http://0.0.0.0")).toBe(false)
  })
})
