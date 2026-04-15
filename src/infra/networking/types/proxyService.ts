import { Readable } from "stream"

/**
 * Standard response object for any proxy implementation
 */
export interface ProxyResult {
  stream: Readable // Both PassThrough and fs.ReadStream extend Readable
  contentType: string
  abort: () => void
}

/**
 * Common interface for Proxy Services
 */
export interface ProxyService {
  stream(remoteUrl: string): Promise<ProxyResult>
}
