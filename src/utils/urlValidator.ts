import { URL } from "url"

/**
 * Blocked private/internal IP ranges for SSRF prevention.
 * Blocks: loopback, link-local, private RFC1918, cloud metadata, and IPv6 equivalents.
 */
const PRIVATE_IP_PATTERNS = [
  /^127\.\d+\.\d+\.\d+$/, // IPv4 loopback
  /^10\.\d+\.\d+\.\d+$/, // RFC1918 Class A
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // RFC1918 Class B
  /^192\.168\.\d+\.\d+$/, // RFC1918 Class C
  /^169\.254\.\d+\.\d+$/, // Link-local / cloud metadata
  /^0\.0\.0\.0$/, // Unspecified
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
  /^fd[0-9a-f]{2}:/i, // IPv6 unique local
]

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"])

/**
 * Returns true if the URL is safe to fetch (external HTTP/HTTPS, no private IPs).
 */
export function isSafeExternalUrl(input: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return false
  }

  // Only allow http and https schemes
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false
  }

  const hostname = parsed.hostname.toLowerCase()

  // Block known internal hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return false
  }

  // Block private/internal IP ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return false
    }
  }

  return true
}
